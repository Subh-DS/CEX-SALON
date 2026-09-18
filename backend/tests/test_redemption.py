async def test_tiers(client):
    r = await client.get("/api/v1/loyalty/tiers")
    assert r.status_code == 200
    tiers = r.json()["data"]
    assert [t["name"] for t in tiers] == ["Seed", "Bloom", "Flourish", "Radiance"]
    flourish = next(t for t in tiers if t["name"] == "Flourish")
    assert "10% off services" in flourish["benefits"]


async def test_redeem_flow(client, auth_headers):
    rewards = (await client.get("/api/v1/loyalty/rewards")).json()["data"]
    scalp = next(r for r in rewards if r["points_cost"] == 300)
    pricey = next(r for r in rewards if r["points_cost"] == 1200)

    # Priya seeded with 320 points: 1200-cost reward must fail honestly
    r = await client.post(f"/api/v1/loyalty/rewards/{pricey['id']}/redeem", headers=auth_headers)
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INSUFFICIENT_POINTS"

    # 300-cost reward succeeds; balance authoritative from response
    r = await client.post(f"/api/v1/loyalty/rewards/{scalp['id']}/redeem", headers=auth_headers)
    assert r.status_code == 200, r.text
    data = r.json()["data"]
    assert data["points_balance"] == 20
    assert data["code"].startswith("GLOW-")

    # Second redeem now fails (20 < 300) — no double-spend
    r = await client.post(f"/api/v1/loyalty/rewards/{scalp['id']}/redeem", headers=auth_headers)
    assert r.status_code == 422

    # Ledger recorded
    tx = (await client.get("/api/v1/loyalty/transactions", headers=auth_headers)).json()["data"]
    assert any(t["points"] == -300 and t["reference_type"] == "reward" for t in tx)


async def test_redeem_unknown_reward(client, auth_headers):
    r = await client.post(
        "/api/v1/loyalty/rewards/00000000-0000-0000-0000-000000000000/redeem",
        headers=auth_headers,
    )
    assert r.status_code == 404
