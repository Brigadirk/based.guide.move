from services.exchange_rate_service import convert, fetch_and_save_latest_rates


def setup_module(module):
    # Ensure we have newest rates before running conversion tests
    fetch_and_save_latest_rates(force=True)


def test_identity_conversion():
    assert convert(100, 'USD', 'USD') == 100


def test_eur_to_usd_and_back():
    amount_eur = 50
    usd = convert(amount_eur, 'EUR', 'USD')
    # Now convert back (may incur float error)
    eur_back = convert(usd, 'USD', 'EUR')
    assert abs(eur_back - amount_eur) < 0.5  # allow small tolerance
