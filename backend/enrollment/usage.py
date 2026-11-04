"""Staged allowance calculation, not a connected usage feed or carrier cutoff.
Adapter must authenticate the account and fetch all completed source records.
Use account-local billing boundaries converted to UTC; never a calendar-month guess.
"""
from decimal import Decimal, ROUND_CEILING

def statement(*, start, end, as_of, allowance, calls, boosters=()):
    if not start < end or as_of < start or allowance < 0:
        raise ValueError('Invalid service period or allowance')
    seen = {}; seconds = Decimal(0)
    for call in calls:
        ident = call['id']; duration = Decimal(str(call['seconds']))
        if not ident or not duration.is_finite() or duration < 0:
            raise ValueError('Invalid call record')
        record = (call['started_at'], duration, call['completed'])
        if ident in seen and seen[ident] != record:
            raise ValueError('Conflicting source record; reconcile before reporting')
        if ident in seen: continue
        seen[ident] = record
        if call['completed'] and start <= call['started_at'] < end and call['started_at'] <= as_of:
            seconds += duration
    credits = {}; extra = 0
    for credit in boosters:
        if not credit['paid'] or credit['period_start'] != start or credit['period_end'] != end:
            continue
        ident = credit['payment_id']; minutes = credit['minutes']
        if not ident or type(minutes) is not int or minutes <= 0:
            raise ValueError('Invalid paid credit')
        if ident in credits and credits[ident] != minutes:
            raise ValueError('Conflicting credit; reconcile before reporting')
        if ident in credits: continue
        credits[ident] = minutes; extra += minutes
    total = allowance + extra
    used = int((seconds / 60).to_integral_value(rounding=ROUND_CEILING))
    return dict(period_start=start, period_end=end, as_of=as_of, included=allowance,
                purchased=extra, used=used, remaining=max(0,total-used),
                exceeded=max(0,used-total), thresholds=[n for n in (70,80,90,100) if total and used*100 >= total*n])
