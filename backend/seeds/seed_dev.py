"""Create all tables + insert realistic dev seed data. Idempotent."""

import asyncio
import json
from datetime import time

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal, engine
from app.models import Base
from app.models.loyalty import LoyaltyAccount, LoyaltyTier, Reward
from app.models.salon import Branch, Salon, Service, ServiceCategory, StaffAvailability, StaffService
from app.models.users import CustomerProfile, StaffProfile, User


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as s:
        if (await s.execute(select(Salon))).scalars().first():
            print("Seed already present, skipping.")
            return

        salon = Salon(name="Sundara Flagship", description="Contemporary Indian premium beauty")
        s.add(salon)
        await s.flush()
        branch = Branch(salon_id=salon.id, name="Patia, Bhubaneswar", address="Plot 12, Patia", city="Bhubaneswar", phone="+91 674 000 0000")
        s.add(branch)
        await s.flush()

        cats = {}
        for i, (name, desc) in enumerate([("Hair", "Cuts, spas, color"), ("Skin", "Facials, cleanups"), ("Nails", "Mani-pedi")]):
            c = ServiceCategory(name=name, description=desc, display_order=i)
            s.add(c)
            await s.flush()
            cats[name] = c

        services = {}
        for name, cat, dur, price, desc in [
            ("Classic Haircut", "Hair", 45, 599, "Precision cut + wash + finish"),
            ("Hair Spa Ritual", "Hair", 60, 1499, "Deep nourishment with warm oils"),
            ("Hair Coloring", "Hair", 120, 3499, "Ammonia-free global color"),
            ("Signature Facial", "Skin", 75, 1999, "Deep-cleanse + glow mask"),
            ("Cleanup Express", "Skin", 30, 799, "30-minute glow refresh"),
            ("Manicure + Pedicure", "Nails", 90, 1299, "Shape, buff, polish, massage"),
        ]:
            sv = Service(category_id=cats[cat].id, name=name, duration_minutes=dur, price=price, description=desc)
            s.add(sv)
            await s.flush()
            services[name] = sv

        staff_defs = [
            ("Ananya Sharma", ["Hair Spa Ritual", "Hair Coloring"], 8, 4.9, 212),
            ("Kabir Menon", ["Classic Haircut"], 6, 4.8, 187),
            ("Divya Patnaik", ["Signature Facial", "Cleanup Express", "Manicure + Pedicure"], 7, 4.9, 164),
        ]
        for name, offers, exp, rating, rc in staff_defs:
            email = name.split()[0].lower() + "@sundara.in"
            u = User(email=email, password_hash=hash_password("staff1234"), role="staff")
            s.add(u)
            await s.flush()
            s.add(StaffProfile(user_id=u.id, branch_id=branch.id, name=name,
                               specialties=json.dumps(offers), experience_years=exp, rating=rating, review_count=rc))
            for svc_name in offers:
                s.add(StaffService(staff_id=u.id, service_id=services[svc_name].id))
            for dow in range(6):  # Mon-Sat, 09:00-19:00
                s.add(StaffAvailability(staff_id=u.id, day_of_week=dow, start_time=time(9, 0), end_time=time(19, 0)))

        demo = User(email="priya@example.com", phone="+91 98765 43210", password_hash=hash_password("customer123"), role="customer")
        s.add(demo)
        await s.flush()
        admin = User(email="admin@sundara.in", password_hash=hash_password("admin1234"), role="admin")
        s.add(admin)
        s.add(CustomerProfile(user_id=demo.id, name="Priya Mohanty"))
        s.add(LoyaltyAccount(user_id=demo.id, points_balance=320, total_earned=720, total_redeemed=400, tier="Bloom"))

        for i, (name, pts, benefits) in enumerate([
            ("Seed", 0, ["Earn points from visit one"]),
            ("Bloom", 500, ["5% off services", "Priority booking", "Birthday reward"]),
            ("Flourish", 1500, ["10% off services", "Free add-ons", "Members-only offers"]),
            ("Radiance", 4000, ["15% off services", "Personal stylist", "VIP events"]),
        ]):
            s.add(LoyaltyTier(name=name, min_points=pts, benefits=json.dumps(benefits), display_order=i))
        for name, desc, cost, value in [
            ("₹50 off coupon", "Flat ₹50 off any booking", 400, 50),
            ("Free scalp massage add-on", "With any hair service", 300, 199),
            ("Free blow-dry", "With any haircut", 500, 399),
            ("Free haircut", "Classic haircut, any expert", 1200, 599),
        ]:
            s.add(Reward(name=name, description=desc, points_cost=cost, value=value))

        await s.commit()
        print("Seed complete: 1 salon, 6 services, 3 staff, 1 demo customer (priya@example.com / customer123).")


if __name__ == "__main__":
    asyncio.run(seed())
