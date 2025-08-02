from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('manager', 'مدیر موسسه'),
        ('school_admin', 'مدیر مدرسه'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

class School(models.Model):
    name = models.CharField(max_length=100)
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='school', null=True, blank=True)

    def __str__(self):
        return self.name

class Store(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class BudgetType(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Budget(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='budgets')
    budget_type = models.ForeignKey(BudgetType, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.school.name} - {self.budget_type.name} - {self.amount}"

class Purchase(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='purchases')
    store = models.ForeignKey(Store, on_delete=models.PROTECT)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    price = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def total(self):
        return self.quantity * self.price

class Invoice(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='invoices')
    created_at = models.DateTimeField(auto_now_add=True)
    tax_amount = models.PositiveIntegerField(default=0)

    def total_amount(self):
        return sum([p.total for p in self.purchases.all()])


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='purchases')
    purchase = models.OneToOneField(Purchase, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.purchase.description} - {self.purchase.total}"
