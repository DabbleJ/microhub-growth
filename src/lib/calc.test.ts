import { describe, expect, it } from 'vitest';
import { calculate } from './calc';
import { defaultInputs } from './defaults';
describe('Hub economics', () => {
  it('reconciles revenue, costs, profit and cumulative cash for every year', () => {
    const m = calculate(defaultInputs);
    let cash = -m.startup;
    for (const y of m.years) {
      expect(y.revenue).toBeCloseTo(y.logisticsRevenue + y.communityRevenue);
      expect(y.costs).toBeCloseTo(y.rent + y.labor + y.fleet + y.other + y.cogs + y.damage + y.sharing);
      expect(y.profit).toBeCloseTo(y.revenue - y.costs);
      cash += y.profit;
      expect(y.cumulative).toBeCloseTo(cash);
    }
    expect(m.years[0].deliveries).toBeCloseTo(32760);
    expect(m.years[0].rent).toBe(72000);
  });
  it('separates operating break-even from startup cash payback', () => {
    const m = calculate({ ...defaultInputs, price: 100, startup: 100000000 });
    expect(m.breakEven).toBe(1);
    expect(m.payback).toBeNull();
    expect(calculate({ ...defaultInputs, price: 0 }).breakEven).toBeNull();
  });
  it('caps grants at equipment and never offsets fit-out or operating costs', () => {
    const base = calculate(defaultInputs);
    const funded = calculate({ ...defaultInputs, grant: 1000000 });
    expect(funded.grantApplied).toBe(base.equipment);
    expect(funded.startup).toBe(Number(defaultInputs.startup));
    expect(funded.years[0].costs).toBe(base.years[0].costs);
  });
  it('excludes leased vehicle purchase prices from eligible capex', () => {
    const m = calculate({ ...defaultInputs, activeMode: 'lease', reserveMode: 'lease', vanMode: 'lease', grant: 1000000 });
    expect(m.equipment).toBe(4300);
    expect(m.grantApplied).toBe(4300);
    expect(m.years[0].fleet).toBeGreaterThan(calculate(defaultInputs).years[0].fleet);
  });
  it('rejects late grants and accepts purchases on deadline', () => {
    expect(calculate({ ...defaultInputs, grant: 10000, startDate: '2027-07-01' }).grantApplied).toBe(0);
    expect(calculate({ ...defaultInputs, grant: 10000, startDate: '2027-06-30' }).grantApplied).toBe(10000);
  });
  it('adds community revenue, staffing, COGS and area only when enabled', () => {
    const a = calculate(defaultInputs), b = calculate({ ...defaultInputs, storeEnabled: true });
    expect(a.communitySf).toBe(0);
    expect(b.communitySf).toBe(450);
    expect(b.years[1].communityRevenue).toBe(90000);
    expect(b.years[1].cogs).toBe(49500);
    expect(b.years[1].labor).toBeGreaterThan(a.years[1].labor);
  });
  it('never shares losses and handles zero delivery volumes', () => {
    const m = calculate({ ...defaultInputs, deliveries: 0 });
    expect(m.costPerDelivery).toBeNull();
    expect(m.years.every(y => y.sharing === 0)).toBe(true);
  });
});
