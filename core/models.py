from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('manager', 'مدیر مؤسسه'),
        ('school', 'مدیر مدرسه'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class School(models.Model):
    name = models.CharField(max_length=200)
    manager = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'school'})
    budget_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return self.name

class Budget(models.Model):
    BUDGET_TYPES = [
        ('type1', 'سرانه نوع ۱'),
        ('type2', 'سرانه نوع ۲'),
        ('type3', 'سرانه نوع ۳'),
    ]
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    budget_type = models.CharField(max_length=10, choices=BUDGET_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

class Store(models.Model):
    name = models.CharField(max_length=200)
    max_purchase_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    def __str__(self):
        return self.name

class Purchase(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    price = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.school.name} - {self.amount}"
    @property
    def total(self):
        return self.quantity * self.price

class ManagerSettings(models.Model):
    tax_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0)