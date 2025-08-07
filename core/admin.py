from django.contrib import admin
from .models import User, School, Store, BudgetType, Budget, Purchase, Invoice, InvoiceItem

admin.site.register(User)
admin.site.register(School)
admin.site.register(Store)
admin.site.register(BudgetType)
admin.site.register(Budget)
admin.site.register(Purchase)
admin.site.register(Invoice)
admin.site.register(InvoiceItem)