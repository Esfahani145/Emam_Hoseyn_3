from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, BudgetListCreateView, PurchaseListCreateView, InvoiceListView, \
    BudgetTypeListView, PurchaseSummaryView, allowances_by_school, BudgetUpdateView, ChangePasswordView, \
    PurchaseViewSet, store_sales_stats
from . import views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('select_store/', views.select_store),
    path('stores/', views.store_list),
    path('api/allowances/<int:school_id>/', allowances_by_school, name='allowances_by_school'),
    path('budgets/', BudgetListCreateView.as_view(), name='budgets'),
    path('budgets/update/<int:pk>/', BudgetUpdateView.as_view(), name='budget-update'),
    path('budget-types/', BudgetTypeListView.as_view(), name='budget-types'),
    path('my_budget/', views.my_budget, name='my_budget'),
    path('purchases/', PurchaseListCreateView.as_view(), name='purchases'),
    path('invoices/', InvoiceListView.as_view(), name='invoices'),
    path('store_stats/', views.store_stats, name='store_stats'),
    path('store_sales_stats/', store_sales_stats, name='store-sales-stats'),
    path('purchase-summary/', PurchaseSummaryView.as_view(), name='purchase-summary'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
