from rest_framework import serializers
from .models import User, School, Store, BudgetType, Budget, Purchase, Invoice, InvoiceItem, Allowance
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'email']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            role=validated_data['role'],
            email=validated_data.get('email', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class SchoolSerializer(serializers.ModelSerializer):
    admin = UserSerializer(read_only=True)
    admin_id = serializers.PrimaryKeyRelatedField(write_only=True, queryset=User.objects.filter(role='school_admin'))

    class Meta:
        model = School
        fields = ['id', 'name', 'admin', 'admin_id']


class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['id', 'name']


class BudgetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetType
        fields = ['id', 'name']


class BudgetSerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(queryset=School.objects.all())
    budget_type = serializers.PrimaryKeyRelatedField(queryset=BudgetType.objects.all())

    class Meta:
        model = Budget
        fields = ['id', 'school', 'budget_type', 'amount']


class PurchaseSerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(queryset=School.objects.all(), required=False)
    store = serializers.PrimaryKeyRelatedField(queryset=Store.objects.all())
    total = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = ['id', 'school', 'store', 'description', 'quantity', 'price', 'total', 'created_at']

    def get_total(self, obj):
        return obj.quantity * obj.price

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'school'):
            validated_data['school'] = request.user.school
        return super().create(validated_data)


class AllowanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Allowance
        fields = ['id', 'title', 'amount', 'type', 'school']


class InvoiceItemSerializer(serializers.ModelSerializer):
    purchase = PurchaseSerializer()

    class Meta:
        model = InvoiceItem
        fields = ['id', 'purchase']


class InvoiceSerializer(serializers.ModelSerializer):
    purchases = InvoiceItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = ['id', 'school', 'created_at', 'tax_amount', 'total_amount', 'purchases']

    def get_total_amount(self, obj):
        return obj.total_amount()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role

        if user.role == 'school_admin' and hasattr(user, 'school'):
            token['school_id'] = user.school.id
            token['school_name'] = user.school.name

        return token
