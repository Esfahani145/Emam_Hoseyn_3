from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # پنل مدیر
    path('manager/', views.manager_dashboard, name='manager_dashboard'),
    path('manager/add_store/', views.add_store, name='add_store'),
    path('manager/delete_store/<int:store_id>/', views.delete_store, name='delete_store'),
    path('manager/set_budget/<int:school_id>/', views.set_budget, name='set_budget'),
    path('manager/invoices/', views.invoices_list, name='invoices'),

    # پنل مدرسه
    path('add_purchase/', views.add_purchase, name='add_purchase'),
]
