from .models import Invoice, InvoiceItem, Purchase
from django.utils import timezone

def create_invoice_for_school(school):
    purchases = Purchase.objects.filter(school=school, invoiceitem__isnull=True)

    if not purchases.exists():
        return None

    invoice = Invoice.objects.create(school=school, created_at=timezone.now())

    for purchase in purchases:
        InvoiceItem.objects.create(invoice=invoice, purchase=purchase)

    return invoice
