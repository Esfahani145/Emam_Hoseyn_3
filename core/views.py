from .models import User, Budget, Invoice, Purchase, School, BudgetType, Store
from .serializers import UserSerializer, BudgetSerializer, PurchaseSerializer, InvoiceSerializer
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer, SchoolSerializer, BudgetTypeSerializer, StoreSerializer, \
    AllowanceSerializer
from django.utils.timezone import now
from .utils import create_invoice_for_school
from .models import Allowance
from django.db.models import F, Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions, status, viewsets
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

User = get_user_model()
@api_view(['GET'])
def invoice_list(request):
    start = request.GET.get('start_date')
    end = request.GET.get('end_date')

    purchases = Purchase.objects.all()

    if start and end:
        purchases = purchases.filter(created_at__date__range=[start, end])
    else:
        purchases = purchases.filter(created_at__date__lte=now().date())

    serializer = PurchaseSerializer(purchases, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchase_summary(request):
    schools = School.objects.all()
    data = []

    for school in schools:
        total_budget = Budget.objects.filter(school=school).aggregate(Sum('amount'))['amount__sum'] or 0
        total_spent = Purchase.objects.filter(school=school).aggregate(
            total=Sum(F('price') * F('quantity'))
        )['total'] or 0
        remaining = total_budget - total_spent
        items = Purchase.objects.filter(school=school).values_list('item__name', flat=True)
        summary = ", ".join(set(items))

        data.append({
            "school_id": school.id,
            "school_name": school.name,
            "total_budget": total_budget,
            "total_spent": total_spent,
            "remaining": remaining,
            "items_summary": summary
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def select_store(request):
    store_id = request.data.get('store')
    if not store_id:
        return Response({'error': 'store id is required'}, status=400)

    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        return Response({'error': 'store not found'}, status=404)

    request.user.store = store
    request.user.save()
    return Response({'message': 'store selected successfully'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def store_list(request):
    if request.method == 'GET':
        stores = Store.objects.all()
        data = [{'id': s.id, 'name': s.name} for s in stores]
        return Response(data)

    elif request.method == 'POST':
        name = request.data.get('name')
        store = Store.objects.create(name=name)
        return Response({'id': store.id, 'name': store.name}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def store_stats(request):
    stores = Store.objects.all()
    data = []
    for store in stores:
        data.append({
            'id': store.id,
            'name': store.name,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_budget(request):
    school_id = request.auth.get('school_id')  # JWT decoded payload

    if not school_id:
        return Response({"error": "school_id not found in token"}, status=400)

    total = Budget.objects.filter(school_id=school_id).aggregate(Sum('amount'))['amount__sum'] or 0

    return Response({
        "amount": total,
        "type": "مدرسه",
        "year": 1403
    })


@api_view(['GET'])
def store_sales_stats(request):
    # مجموع مبلغ = جمع (price * quantity)
    stats = (
        Purchase.objects
        .values('store__id', 'store__name')
        .annotate(total_sales=Sum(F('price') * F('quantity')))
        .order_by('-total_sales')
    )
    return Response(stats)


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def allowances_by_school(request, school_id):
    allowances = Allowance.objects.filter(school_id=school_id)
    serializer = AllowanceSerializer(allowances, many=True)
    return Response(serializer.data)

class BudgetUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'school_admin':
            return Budget.objects.filter(school=user.school)
        elif user.role == 'manager':
            return Budget.objects.all()
        return Budget.objects.none()


class BudgetListCreateView(generics.ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'school_admin':
            return Budget.objects.filter(school=user.school)
        elif user.role == 'manager':
            return Budget.objects.all()
        else:
            return Budget.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'manager':
            raise PermissionDenied("فقط مدیر مدرسه می‌تواند خرید ثبت کند")
            serializer.save()


class PurchaseListCreateView(generics.ListCreateAPIView):
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'school_admin':
            return Purchase.objects.filter(school=user.school)
        elif user.role == 'manager':
            return Purchase.objects.all()
        return Purchase.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'school_admin':
            raise PermissionError("فقط مدیر مدرسه می‌تواند خرید ثبت کند")
        serializer.save()


class InvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return Invoice.objects.all()
        return Invoice.objects.none()


class SchoolListView(generics.ListAPIView):
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            return School.objects.all()
        elif user.role == 'school_admin':
            return School.objects.filter(admin=user)
        return School.objects.none()


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class BudgetTypeListView(generics.ListAPIView):
    queryset = BudgetType.objects.all()
    serializer_class = BudgetTypeSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class StoreListCreateView(generics.ListCreateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            if self.request.user.role != 'manager':
                self.permission_denied(self.request, message="فقط مدیر موسسه اجازه دارد")
        return super().get_permissions()


class PurchaseSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'manager':
            return Response({'detail': 'Unauthorized'}, status=403)

        schools = School.objects.all()
        summary = []

        for school in schools:
            total_budget = Budget.objects.filter(school=school).aggregate(Sum('amount'))['amount__sum'] or 0
            purchases = Purchase.objects.filter(school=school)
            total_spent = sum([p.total for p in purchases])
            items = [p.description for p in purchases]

            summary.append({
                'school_id': school.id,
                'school_name': school.name,
                'total_budget': total_budget,
                'total_spent': total_spent,
                'remaining': total_budget - total_spent,
                'items_summary': '، '.join(items)
            })

        return Response(summary)


class PurchaseCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        purchases_data = request.data.get("purchases", [])

        school = request.user.school
        purchases = []

        for item in purchases_data:
            purchase = Purchase.objects.create(
                school=school,
                store_id=item["store"],
                description=item["description"],
                quantity=item["quantity"],
                price=item["price"]
            )
            purchases.append(purchase)

        invoice = create_invoice_for_school(school)

        return Response({"detail": "خریدها ثبت شدند", "invoice_id": invoice.id if invoice else None})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"detail": "رمز قدیمی اشتباه است"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "رمز با موفقیت تغییر کرد"}, status=status.HTTP_200_OK)
