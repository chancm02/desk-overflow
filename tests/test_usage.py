import importlib.util,unittest
from pathlib import Path
s=importlib.util.spec_from_file_location('usage',Path(__file__).resolve().parents[1]/'backend/enrollment/usage.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
class UsageTests(unittest.TestCase):
 def calc(self,calls=(),boosters=()):return m.statement(start=100,end=200,as_of=190,allowance=10,calls=calls,boosters=boosters)
 def call(self,id='a',at=110,seconds=480):return dict(id=id,started_at=at,seconds=seconds,completed=True)
 def test_duplicates_and_period_boundaries(self):
  a=self.call();r=self.calc([a,a,self.call('old',99),self.call('next',200)])
  self.assertEqual((r['used'],r['remaining'],r['thresholds']),(8,2,[70,80]))
 def test_paid_current_period_credit_once(self):
  b=dict(payment_id='pi_1',paid=True,period_start=100,period_end=200,minutes=250)
  self.assertEqual(self.calc(boosters=[b,b])['purchased'],250)
  self.assertEqual(self.calc(boosters=[dict(b,paid=False),dict(b,period_end=300)])['purchased'],0)
 def test_conflicts_require_reconciliation(self):
  with self.assertRaises(ValueError):self.calc([self.call(),self.call(seconds=500)])
 def test_overage_is_visible_not_a_charge(self):
  r=self.calc([self.call(seconds=661)]);self.assertEqual((r['used'],r['remaining'],r['exceeded']),(12,0,2));self.assertNotIn('charge',r)
if __name__=='__main__':unittest.main()
