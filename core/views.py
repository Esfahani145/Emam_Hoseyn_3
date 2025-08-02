from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, School, Store, Budget, BudgetType, Purchase, Invoice
from .serializers import UserSerializer, SchoolSerializer, StoreSerializer, BudgetSerializer, PurchaseSerializer, \
    InvoiceSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from core.models import Store
from core.serializers import StoreSerializer


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


# core/views.py
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


class BudgetListCreateView(generics.ListCreateAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'school_admin':
            # فقط بودجه مدرسه خودش رو ببینه
            return Budget.objects.filter(school=user.school)
        elif user.role == 'manager':
            # مدیر موسسه همه بودجه‌ها رو ببینه
            return Budget.objects.all()
        else:
            return Budget.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'manager':
            raise PermissionError("فقط مدیر موسسه می‌تواند بودجه ایجاد کند")
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
