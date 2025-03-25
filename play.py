data = {
    "rates": {
        "ARS": 1063.7901,
        "EUR": 0.942611,
        "SEK": 10.452951,
        "EUR": 0.942611
    }
}

ars_amount = 560000
ars_to_usd = ars_amount / data["rates"]["ARS"]
print(ars_to_usd)
usd_to_eur = ars_to_usd * (1 / data["rates"]["EUR"])
print(usd_to_eur)
result = (usd_to_eur / 12) * 366
print(result)
eur_to_sek = result * (data["rates"]["SEK"]/data["rates"]["EUR"])
print(eur_to_sek)
