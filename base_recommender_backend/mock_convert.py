
def convert(amount, from_currency, to_currency):
    # Simple mock conversion - just return the amount
    return amount

def _format_money(amount, currency, dest_currency):
    return f'{amount:,.0f} {dest_currency}'
