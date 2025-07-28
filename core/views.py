from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Budget, Purchase, Store, School, ManagerSettings
from django.db.models import Sum, F, Value, CharField
from django.db.models.functions import Concat
from django.http import JsonResponse
from django.contrib import messages
from decimal import Decimal

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'نام کاربری یا رمز عبور اشتباه است.'})
    return render(request, 'login.html')

@login_required
def dashboard_view(request):
    if request.user.role == 'manager':
        return redirect('manager_dashboard')

    elif request.user.role == 'school':
        try:
            school = School.objects.get(manager=request.user)
        except School.DoesNotExist:
            return render(request, 'error.html', {'message': 'مدرسه‌ای برای این کاربر پیدا نشد.'})

        budget = Budget.objects.filter(school=school).first()
        purchases = Purchase.objects.filter(school=school)
        total_spent = 0
        budget_exceeded = budget and total_spent > budget.amount
        for p in purchases:
            if p.price is not None and p.quantity is not None:
                try:
                    total_spent += p.total
                except:
                    pass
        return render(request, 'school_dashboard.html', {
            'budget': budget,
            'purchases': purchases,
            'total_spent': total_spent,
            'budget_exceeded': budget_exceeded
        })

    return redirect('login')

def school_dashboard(request, school_id):
    school = School.objects.get(id=school_id)
    purchases = Purchase.objects.filter(school=school)

    total_spent = purchases.aggregate(Sum('amount'))['amount__sum'] or 0
    if total_spent > school.budget_limit:
        messages.warning(request, "هشدار: مجموع خریدها از سرانه تعیین شده بیشتر است!")

    return render(request, 'school_dashboard.html', {
        'school': school,
        'purchases': purchases,
        'total_spent': total_spent
    })

@login_required
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
def add_purchase(request):
    if request.user.role != 'school':
        return redirect('dashboard')

    school = School.objects.get(manager=request.user)
    stores = Store.objects.all()

    if request.method == 'POST':
        store_id = request.POST.get('store')
        if not store_id:
            return render(request, 'purchases_form.html', {
                'stores': stores,
                'error': 'لطفاً فروشگاه را انتخاب کنید.'
            })
        description = request.POST.get('description')
        quantity = int(request.POST.get('quantity', 0))
        price = float(request.POST.get('price', 0))

        store = get_object_or_404(Store, id=store_id)
        Purchase.objects.create(
            school=school,
            store=store,
            description=description,
            quantity=quantity,
            price=price
        )
        return redirect('dashboard')

    return render(request, 'purchases_form.html', {'stores': stores})

@login_required
def invoices_list(request):
    if request.user.role != 'manager':
        return redirect('dashboard')

    # گرفتن همه خریدها با مدرسه و فروشگاه مرتبط
    purchases = Purchase.objects.select_related('school', 'store')

    # ساختن دیکشنری: کلید (school_name, store_name)
    # مقدار: توضیحات پشت هم و جمع مبلغ (quantity * price)
    invoice_dict = {}

    for p in purchases:
        key = (p.school.name, p.store.name)
        amount = p.quantity * p.price

        if key not in invoice_dict:
            invoice_dict[key] = {
                'descriptions': [],
                'total_amount': 0,
            }
        invoice_dict[key]['descriptions'].append(p.description)
        invoice_dict[key]['total_amount'] += amount

    # توضیحات رو به یک رشته تبدیل می‌کنیم (با کاما جدا می‌کنیم)
    for key in invoice_dict:
        invoice_dict[key]['descriptions'] = ', '.join(invoice_dict[key]['descriptions'])

    return render(request, 'invoices_list.html', {
        'invoice_dict': invoice_dict
    })

@login_required
def manage_purchases(request):
    if request.method == 'POST':
        data = request.POST
        purchases = []

        # داده‌ها از فرم ارسال شده
        rows = int(data.get('total_rows', 0))

        for i in range(rows):
            desc = data.get(f'description_{i}', '')
            qty = data.get(f'quantity_{i}', '0')
            price = data.get(f'price_{i}', '0')
            school_id = data.get(f'school_{i}')
            store_id = data.get(f'store_{i}')

            if not desc or not school_id or not store_id:
                continue

            amount = Decimal(qty) * Decimal(price)
            if amount > Decimal('10000000'):  # مثال: اگر بیشتر از 10 میلیون بود
                messages.warning(request, f"مبلغ خرید {desc} از حد مجاز بیشتر است!")

            Purchase.objects.create(
                description=desc,
                quantity=qty,
                price=price,
                school_id=school_id,
                store_id=store_id
            )

        messages.success(request, "خریدها ذخیره شدند.")
        return redirect('manage_purchases')

    schools = School.objects.all()
    stores = Store.objects.all()
    purchases = Purchase.objects.select_related('school', 'store')

    return render(request, 'manage_purchases.html', {
        'purchases': purchases,
        'schools': schools,
        'stores': stores
    })

@login_required
def manage_stores(request):
    if request.method == 'POST':
        data = request.POST
        rows = int(data.get('total_rows', 0))

        for i in range(rows):
            name = data.get(f'store_name_{i}', '')
            if name:
                Store.objects.get_or_create(name=name)

        messages.success(request, "فروشگاه‌ها ذخیره شدند.")
        return redirect('manage_stores')

    stores = Store.objects.all()
    return render(request, 'manage_stores.html', {'stores': stores})

@login_required
def manager_dashboard(request):
    if request.user.role != 'manager':
        return redirect('dashboard')

    stores = Store.objects.all()
    schools = School.objects.all()
    budgets = Budget.objects.all()

    return render(request, 'manager_dashboard.html', {
        'stores': stores,
        'schools': schools,
        'budgets': budgets,
    })

@login_required
def add_store(request):
    if request.user.role != 'manager':
        return redirect('dashboard')

    if request.method == 'POST':
        name = request.POST.get('name')
        if name:
            Store.objects.create(name=name)
            return redirect('manager_dashboard')
    return render(request, 'add_store.html')

@login_required
def delete_store(request, store_id):
    if request.user.role != 'manager':
        return redirect('dashboard')

    store = get_object_or_404(Store, id=store_id)
    store.delete()
    return redirect('manager_dashboard')

@login_required
def set_budget(request, school_id):
    if request.user.role != 'manager':
        return redirect('dashboard')

    school = get_object_or_404(School, id=school_id)
    if request.method == 'POST':
        budget_type = request.POST.get('budget_type')
        amount = request.POST.get('amount')
        if budget_type and amount:
            Budget.objects.update_or_create(
                school=school,
                budget_type=budget_type,
                defaults={'amount': amount}
            )
            return redirect('manager_dashboard')

    return render(request, 'set_budget.html', {'school': school})

def manager_stores(request):
    stores = Store.objects.all()
    return render(request, 'manager_stores.html', {'stores': stores})

# تنظیمات مالیات مدیر
def manager_settings(request):
    settings, created = ManagerSettings.objects.get_or_create(id=1)

    if request.method == 'POST':
        settings.tax_limit = request.POST.get('tax_limit')
        settings.save()
        messages.success(request, "تنظیمات ذخیره شد!")

    alerts = []
    for store in Store.objects.all():
        total = Purchase.objects.filter(store=store).aggregate(Sum('amount'))['amount__sum'] or 0
        if total > settings.tax_limit:
            alerts.append(f"خرید از {store.name} بیش از حد تعیین شده است ({total})")

    return render(request, 'manager_settings.html', {'settings': settings, 'alerts': alerts})

# فاکتور مدیر
def manager_invoices(request):
    purchases = Purchase.objects.all()
    return render(request, 'manager_invoices.html', {'purchases': purchases})