from app.services.loyalty_service import points_for_amount, tier_for_lifetime_earned


def test_points_for_amount():
    assert points_for_amount(1499) == 149
    assert points_for_amount(599) == 59
    assert points_for_amount(5) == 0


def test_tier_thresholds():
    assert tier_for_lifetime_earned(0) == "Seed"
    assert tier_for_lifetime_earned(499) == "Seed"
    assert tier_for_lifetime_earned(500) == "Bloom"
    assert tier_for_lifetime_earned(1500) == "Flourish"
    assert tier_for_lifetime_earned(4000) == "Radiance"
    assert tier_for_lifetime_earned(9999) == "Radiance"
