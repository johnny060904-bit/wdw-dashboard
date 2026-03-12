"use client";
import { useState } from "react";

// Real data from our analysis of 1.75M wait time records
const RIDE_DATA = [
  { name: "Flight of Passage", park: "Animal Kingdom", avg: 115, median: 115, std: 54 },
  { name: "Seven Dwarfs Mine Train", park: "Magic Kingdom", avg: 77, median: 70, std: 34 },
  { name: "Slinky Dog Dash", park: "Hollywood Studios", avg: 73, median: 70, std: 28 },
  { name: "Rock 'n' Roller Coaster", park: "Hollywood Studios", avg: 59, median: 55, std: 32 },
  { name: "Toy Story Mania", park: "Hollywood Studios", avg: 54, median: 50, std: 30 },
  { name: "Soarin'", park: "EPCOT", avg: 46, median: 40, std: 27 },
  { name: "Alien Swirling Saucers", park: "Hollywood Studios", avg: 30, median: 30, std: 16 },
  { name: "Pirates of the Caribbean", park: "Magic Kingdom", avg: 29, median: 25, std: 18 },
];

const DAY_DATA = [
  { day: "Mon", avg: 62.3 }, { day: "Tue", avg: 58.4 }, { day: "Wed", avg: 56.2 },
  { day: "Thu", avg: 56.8 }, { day: "Fri", avg: 58.0 }, { day: "Sat", avg: 62.5 }, { day: "Sun", avg: 59.0 },
];

const HOLIDAY_DATA = [
  { period: "Christmas/New Years", avg: 79, pct: 43 },
  { period: "Thanksgiving", avg: 68, pct: 25 },
  { period: "Spring Break", avg: 67, pct: 22 },
  { period: "Summer Peak", avg: 62, pct: 12 },
  { period: "Regular", avg: 55, pct: 0 },
];

const SEASON_DATA = [
  { season: "Winter", avg: 65, color: "#4A90D9" },
  { season: "Spring", avg: 61, color: "#7BC67E" },
  { season: "Summer", avg: 60, color: "#F5A623" },
  { season: "Fall", avg: 51, color: "#D0763C" },
];

const HS_HOURLY: Record<string, number[]> = {
  "Slinky Dog Dash": [59,79,80,84,82,80,81,66,66,78,74,70,66,61,52,47],
  "Toy Story Mania": [30,46,61,63,62,63,66,63,60,55,60,52,45,34,29,28],
  "Rock 'n' Roller Coaster": [24,42,66,72,66,66,66,70,66,66,60,59,55,50,40,40],
  "Alien Swirling Saucers": [18,27,39,41,39,36,36,35,33,30,27,26,22,15,15,15],
};
const HOURS = Array.from({length: 16}, (_, i) => i + 7);

const PARK_COLORS: Record<string, string> = {
  "Hollywood Studios": "#1a5276",
  "Magic Kingdom": "#7f8c8d",
  "Animal Kingdom": "#27ae60",
  "EPCOT": "#8e44ad",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function HBar({ label, value, max, color, suffix }: { label: string; value: number; max: number; color: string; suffix: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-44 text-xs text-gray-600 text-right truncate">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        <span className="absolute right-2 top-0 h-full flex items-center text-xs font-medium text-gray-700">
          {value}{suffix}
        </span>
      </div>
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, colorFn, max }: { data: any[]; valueKey: string; labelKey: string; colorFn?: (d: any, i: number) => string; max?: number }) {
  const maxVal = max || Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="flex items-end gap-1 h-40 mt-4">
      {data.map((d, i) => {
        const h = (d[valueKey] / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-gray-700">{Math.round(d[valueKey])}</span>
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{ height: `${h}%`, backgroundColor: colorFn ? colorFn(d, i) : "#3498db", minHeight: "4px" }}
            />
            <span className="text-xs text-gray-500">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function HeatmapRow({ ride, data, maxVal }: { ride: string; data: number[]; maxVal: number }) {
  return (
    <div className="flex items-center mb-1">
      <div className="w-40 text-xs text-gray-600 text-right pr-2 truncate">{ride}</div>
      <div className="flex-1 flex gap-0.5">
        {data.map((val, i) => {
          const intensity = Math.min(val / maxVal, 1);
          const r = Math.round(255 * intensity + 255 * (1 - intensity));
          const g = Math.round(80 * intensity + 255 * (1 - intensity));
          const b = Math.round(50 * intensity + 230 * (1 - intensity));
          return (
            <div
              key={i}
              className="flex-1 h-8 rounded-sm flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: `rgb(${r},${g},${b})`, color: intensity > 0.5 ? "white" : "#333" }}
              title={`${HOURS[i]}:00 — ${val} min`}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "rides", label: "By Ride" },
    { id: "timing", label: "When to Visit" },
    { id: "hollywood", label: "Hollywood Studios" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-xs font-medium text-blue-200 uppercase tracking-wider mb-1">Data Analysis Project</div>
          <h1 className="text-2xl font-bold mb-1">Walt Disney World Wait Time Analysis</h1>
          <p className="text-blue-200 text-sm">1.75M+ records · 8 attractions · 4 parks · 2015–2021</p>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === t.id ? "bg-gray-50 text-blue-900" : "text-blue-200 hover:text-white hover:bg-blue-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Records" value="1.75M+" sub="Wait time observations" />
              <StatCard label="Date Range" value="7 Years" sub="Jan 2015 – Dec 2021" />
              <StatCard label="Christmas Impact" value="+43%" sub="Longer waits vs regular" />
              <StatCard label="Best Day" value="Wednesday" sub="56 min avg wait" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Holiday Impact on Wait Times</h3>
                {HOLIDAY_DATA.map(h => (
                  <HBar key={h.period} label={h.period} value={h.avg} max={85}
                    color={h.period === "Regular" ? "#27ae60" : h.pct > 30 ? "#e74c3c" : "#f39c12"}
                    suffix={h.pct > 0 ? ` min (+${h.pct}%)` : " min"} />
                ))}
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Average Wait by Season</h3>
                <BarChart data={SEASON_DATA} valueKey="avg" labelKey="season" colorFn={(d) => d.color} max={75} />
                <p className="text-xs text-gray-500 mt-3">Fall is the quietest season with 22% shorter waits than Winter.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rides" && (
          <div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Average Wait Time by Attraction</h3>
              {RIDE_DATA.map(r => (
                <HBar key={r.name} label={r.name} value={r.avg} max={120} color={PARK_COLORS[r.park]} suffix=" min" />
              ))}
              <div className="flex gap-4 mt-4 flex-wrap">
                {Object.entries(PARK_COLORS).map(([park, color]) => (
                  <div key={park} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{park}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Ride Stats Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Ride</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Park</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Avg Wait</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Median</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Std Dev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RIDE_DATA.map(r => (
                      <tr key={r.name} className="border-b border-gray-50">
                        <td className="py-2 font-medium text-gray-800">{r.name}</td>
                        <td className="py-2 text-gray-600">{r.park}</td>
                        <td className="py-2 text-right font-medium">{r.avg} min</td>
                        <td className="py-2 text-right text-gray-600">{r.median} min</td>
                        <td className="py-2 text-right text-gray-600">±{r.std} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timing" && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Best & Worst Days to Visit</h3>
                <BarChart data={DAY_DATA} valueKey="avg" labelKey="day"
                  colorFn={(d) => d.avg <= 56.5 ? "#27ae60" : d.avg >= 62 ? "#e74c3c" : "#3498db"} max={70} />
                <p className="text-xs text-gray-500 mt-3">Midweek visits (Tue–Thu) save ~6 min per ride vs weekends.</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Holiday vs Regular Periods</h3>
                <div className="space-y-3 mt-4">
                  {HOLIDAY_DATA.filter(h => h.pct > 0).map(h => (
                    <div key={h.period} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{h.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">+{h.pct}%</div>
                        <span className="text-sm font-medium text-gray-900">{h.avg} min</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-700">Regular Period</span>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">baseline</div>
                      <span className="text-sm font-medium text-gray-900">55 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Peak Hours</h3>
              <p className="text-xs text-gray-500 mb-3">Wait times peak at 11 AM across all parks. Arrive at rope drop or visit after 7 PM for the shortest waits.</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-red-600 font-bold">11:00 AM</div>
                  <div className="text-xs text-red-400">Peak · 70 min avg</div>
                </div>
                <span className="text-gray-400">→</span>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-green-600 font-bold">8:00 AM</div>
                  <div className="text-xs text-green-400">Rope Drop · 43 min avg</div>
                </div>
                <span className="text-gray-400">→</span>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                  <div className="text-green-600 font-bold">After 7 PM</div>
                  <div className="text-xs text-green-400">Evening · 44 min avg</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "hollywood" && (
          <div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Hollywood Studios — Hourly Wait Heatmap</h3>
              <p className="text-xs text-gray-500 mb-3">Average posted wait time (minutes) by hour for each ride.</p>
              <div className="flex items-center mb-2">
                <div className="w-40" />
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map(h => (
                    <div key={h} className="flex-1 text-center text-xs text-gray-400">{h > 12 ? h-12 : h}{h >= 12 ? 'p' : 'a'}</div>
                  ))}
                </div>
              </div>
              {Object.entries(HS_HOURLY).map(([ride, data]) => (
                <HeatmapRow key={ride} ride={ride} data={data} maxVal={90} />
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Strategy: Hollywood Studios</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="text-green-500 font-bold">1.</span> Hit Slinky Dog Dash at rope drop (59 min vs 84 min at 11 AM)</li>
                  <li className="flex gap-2"><span className="text-green-500 font-bold">2.</span> Ride Rock &#39;n&#39; Roller Coaster before 9 AM or after 7 PM</li>
                  <li className="flex gap-2"><span className="text-green-500 font-bold">3.</span> Save Alien Swirling Saucers for afternoon — it never exceeds 41 min</li>
                  <li className="flex gap-2"><span className="text-green-500 font-bold">4.</span> Toy Story Mania waits drop 50% after 7 PM</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Insider Insight</h3>
                <p className="text-sm text-gray-600">
                  As a Cast Member at Hollywood Studios, I see these patterns firsthand.
                  The data confirms what outdoor vending operations show daily — Slinky Dog Dash
                  and Toy Story Land drive the heaviest foot traffic from mid-morning through mid-afternoon,
                  creating peak demand at nearby food & beverage locations during the same window.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 mt-8 pb-4">
          Built by Johnny Nguyen · Data from Touring Plans · 1,754,414 wait time records analyzed
        </div>
      </div>
    </div>
  );
}
