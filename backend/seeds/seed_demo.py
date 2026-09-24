"""Minimal prod-safe demo seed: one evaluator login + just enough catalog to demo.

Idempotent: every section skips when its rows already exist. Assumes
`alembic upgrade head` already ran (never uses create_all).
Run on Render shell:  python -m seeds.seed_demo

Demo login:  demo@blushstudio.in / demo1234  (customer, 500 pts, Bloom tier)
"""

import asyncio
import json
from datetime import time

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.loyalty import LoyaltyAccount, Reward
from app.models.salon import Branch, Salon, Service, ServiceCategory, StaffAvailability, StaffService
from app.models.users import CustomerProfile, StaffProfile, User

DEMO_EMAIL = "demo@blushstudio.in"
DEMO_PASSWORD = "demo1234"


async def seed() -> None:
    async with SessionLocal() as s:
        salon = (await s.execute(select(Salon))).scalars().first()
        if salon is None:
            salon = Salon(name="The Blush Studio Flagship", description="Contemporary Indian premium beauty")
            s.add(salon)
            await s.flush()
            branch = Branch(salon_id=salon.id, name="Patia, Bhubaneswar", address="Plot 12, Patia",
                            city="Bhubaneswar", phone="+91 674 000 0000")
            s.add(branch)
            await s.flush()
            print("created salon + branch")
        else:
            branch = (await s.execute(select(Branch))).scalars().first()

        cats = {}
        for i, name in enumerate(["Hair", "Skin", "Nails"]):
            c = (await s.execute(select(ServiceCategory).where(ServiceCategory.name == name))).scalar_one_or_none()
            if c is None:
                c = ServiceCategory(name=name, display_order=i)
                s.add(c)
                await s.flush()
            cats[name] = c

        services = {}
        for name, cat, dur, price in [
            ("Classic Haircut", "Hair", 45, 599),
            ("Hair Spa Ritual", "Hair", 60, 1499),
            ("Signature Facial", "Skin", 75, 1999),
        ]:
            sv = (await s.execute(select(Service).where(Service.name == name))).scalar_one_or_none()
            if sv is None:
                sv = Service(category_id=cats[cat].id, name=name, duration_minutes=dur, price=price)
                s.add(sv)
                await s.flush()
            services[name] = sv

        staff_email = "ananya@blushstudio.in"
        staff = (await s.execute(select(User).where(User.email == staff_email))).scalar_one_or_none()
        if staff is None:
            staff = User(email=staff_email, password_hash=hash_password("demo1234"), role="staff")
            s.add(staff)
            await s.flush()
            s.add(StaffProfile(user_id=staff.id, branch_id=branch.id, name="Ananya Sharma",
                               specialties=json.dumps(["Hair Spa Ritual", "Hair Coloring"]),
                               experience_years=8, rating=4.9, review_count=212))
            for svc_name in ("Classic Haircut", "Hair Spa Ritual"):
                s.add(StaffService(staff_id=staff.id, service_id=services[svc_name].id))
            for dow in range(6):
                s.add(StaffAvailability(staff_id=staff.id, day_of_week=dow,
                                        start_time=time(9, 0), end_time=time(19, 0)))
            print("created staff ananya@blushstudio.in / demo1234")

        demo = (await s.execute(select(User).where(User.email == DEMO_EMAIL))).scalar_one_or_none()
        if demo is None:
            demo = User(email=DEMO_EMAIL, password_hash=hash_password(DEMO_PASSWORD), role="customer")
            s.add(demo)
            await s.flush()
            s.add(CustomerProfile(user_id=demo.id, name="Demo Guest"))
            s.add(LoyaltyAccount(user_id=demo.id, points_balance=500, total_earned=500,
                                 total_redeemed=0, tier="Bloom"))
            print(f"created demo login {DEMO_EMAIL} / {DEMO_PASSWORD}")

        n_rewards = (await s.execute(select(func.count()).select_from(Reward))).scalar()
        if not n_rewards:
            for name, desc, cost, value in [
                ("Free scalp massage add-on", "With any hair service", 300, 199),
                ("₹50 off coupon", "Flat ₹50 off any booking", 400, 50),
            ]:
                s.add(Reward(name=name, description=desc, points_cost=cost, value=value))
            print("created demo rewards")

        await s.commit()
        print("Demo seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
