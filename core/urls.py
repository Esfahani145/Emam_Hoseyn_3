from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, StoreListCreateView, BudgetListCreateView, PurchaseListCreateView, InvoiceListView
from . import views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('select_store/', views.select_store),
    path('stores/', views.store_list),
    path('budgets/', BudgetListCreateView.as_view(), name='budgets'),
    path('purchases/', PurchaseListCreateView.as_view(), name='purchases'),
    path('invoices/', InvoiceListView.as_view(), name='invoices'),
]
