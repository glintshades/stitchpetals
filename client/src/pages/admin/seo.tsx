import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Globe, Users, Eye, TrendingUp, TrendingDown, MapPin,
  Search, Settings, ExternalLink, CheckCircle2, Info, ArrowUp, ArrowDown, Building2, Tag
} from "lucide-react";

const DAYS_OPTIONS = [7, 14, 30, 90];

const SOURCE_COLORS: Record<string, string> = {
  direct: "#3e0d57",
  organic: "#10b981",
  social: "#f59e0b",
  referral: "#3b82f6",
};

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  organic: "Organic Search",
  social: "Social Media",
  referral: "Referral",
};

function StatCard({ title, value, prev, icon: Icon, color }: { title: string; value: number; prev?: number; icon: any; color: string }) {
  const change = prev && prev > 0 ? ((value - prev) / prev * 100) : null;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{value.toLocaleString()}</p>
            {change !== null && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
                {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(change).toFixed(1)}% vs previous period
              </div>
            )}
          </div>
          <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSEO() {
  const [days, setDays] = useState(30);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [gaId, setGaId] = useState("");
  const [gscCode, setGscCode] = useState("");

  const adminHeaders = () => ({
    "Authorization": "Bearer admin-token",
  });

  const safeFetch = async (url: string) => {
    const res = await fetch(url, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/admin/analytics/overview", days],
    queryFn: () => safeFetch(`/api/admin/analytics/overview?days=${days}`),
    retry: false,
  });

  const { data: trafficSourcesRaw, isLoading: sourcesLoading } = useQuery({
    queryKey: ["/api/admin/analytics/traffic-sources", days],
    queryFn: () => safeFetch(`/api/admin/analytics/traffic-sources?days=${days}`),
    retry: false,
  });
  const trafficSources = Array.isArray(trafficSourcesRaw) ? trafficSourcesRaw : [];

  const { data: topPagesRaw, isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/admin/analytics/top-pages", days],
    queryFn: () => safeFetch(`/api/admin/analytics/top-pages?days=${days}`),
    retry: false,
  });
  const topPages = Array.isArray(topPagesRaw) ? topPagesRaw : [];

  const { data: byCountryRaw, isLoading: countryLoading } = useQuery({
    queryKey: ["/api/admin/analytics/by-country", days],
    queryFn: () => safeFetch(`/api/admin/analytics/by-country?days=${days}`),
    retry: false,
  });
  const byCountry = Array.isArray(byCountryRaw) ? byCountryRaw : [];

  const { data: byCityRaw, isLoading: cityLoading } = useQuery({
    queryKey: ["/api/admin/analytics/by-city", days],
    queryFn: () => safeFetch(`/api/admin/analytics/by-city?days=${days}`),
    retry: false,
  });
  const byCity = Array.isArray(byCityRaw) ? byCityRaw : [];

  const { data: keywordsRaw, isLoading: keywordsLoading } = useQuery({
    queryKey: ["/api/admin/analytics/search-keywords", days],
    queryFn: () => safeFetch(`/api/admin/analytics/search-keywords?days=${days}`),
    retry: false,
  });
  const keywords = Array.isArray(keywordsRaw) ? keywordsRaw : [];

  const { data: byDayRaw, isLoading: dayLoading } = useQuery({
    queryKey: ["/api/admin/analytics/by-day", days],
    queryFn: () => safeFetch(`/api/admin/analytics/by-day?days=${days}`),
    retry: false,
  });
  const byDay = Array.isArray(byDayRaw) ? byDayRaw : [];

  const { data: settings = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const data = await safeFetch("/api/admin/settings");
      if (data.ga4_measurement_id) setGaId(data.ga4_measurement_id);
      if (data.gsc_verification) setGscCode(data.gsc_verification);
      return data;
    },
    retry: false,
  });

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer admin-token" },
        body: JSON.stringify({ key, value }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Saved", description: "Setting saved successfully." });
    },
  });

  const currentTotal = parseInt(overview?.current?.total_views || "0");
  const currentVisitors = parseInt(overview?.current?.unique_visitors || "0");
  const currentPages = parseInt(overview?.current?.unique_pages || "0");
  const prevTotal = parseInt(overview?.previous?.total_views || "0");
  const prevVisitors = parseInt(overview?.previous?.unique_visitors || "0");

  const chartData = byDay.map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    views: parseInt(d.views),
    visitors: parseInt(d.visitors),
  }));

  const sourcePieData = trafficSources.map((s: any) => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: parseInt(s.visitors),
    source: s.source,
  }));

  const totalSourceVisitors = sourcePieData.reduce((sum: number, s: any) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">SEO & Analytics</h2>
          <p className="text-gray-500 text-sm mt-1">Track your website visitors, traffic sources, and manage Google tools</p>
        </div>
        <div className="flex gap-2">
          {DAYS_OPTIONS.map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
              className={days === d ? "bg-[#3e0d57] text-white" : ""}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="google-tools">Google Tools</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-6 mt-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Page Views" value={currentTotal} prev={prevTotal} icon={Eye} color="#3e0d57" />
            <StatCard title="Unique Visitors" value={currentVisitors} prev={prevVisitors} icon={Users} color="#10b981" />
            <StatCard title="Pages Explored" value={currentPages} icon={Globe} color="#3b82f6" />
          </div>

          {/* Visitors Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visitors Over Time</CardTitle>
              <CardDescription>Daily page views and unique visitors for the last {days} days</CardDescription>
            </CardHeader>
            <CardContent>
              {dayLoading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
              ) : chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
                  <p>No visitor data yet.</p>
                  <p className="text-xs mt-1">Data will appear as people visit your site.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3e0d57" strokeWidth={2} dot={false} name="Page Views" />
                    <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={2} dot={false} name="Visitors" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Traffic Sources + Top Pages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Traffic Sources Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic Sources</CardTitle>
                <CardDescription>How visitors are finding your site</CardDescription>
              </CardHeader>
              <CardContent>
                {sourcesLoading ? (
                  <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
                ) : sourcePieData.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                    <Globe className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No traffic data yet</p>
                  </div>
                ) : (
                  <div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={sourcePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {sourcePieData.map((entry: any, index: number) => (
                            <Cell key={index} fill={SOURCE_COLORS[entry.source] || "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`${val} visitors`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {sourcePieData.map((s: any) => (
                        <div key={s.source} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.source] || "#94a3b8" }} />
                            <span className="text-gray-700">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.value}</span>
                            <Badge variant="outline" className="text-xs">
                              {totalSourceVisitors > 0 ? Math.round(s.value / totalSourceVisitors * 100) : 0}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Pages</CardTitle>
                <CardDescription>Most visited pages on your site</CardDescription>
              </CardHeader>
              <CardContent>
                {pagesLoading ? (
                  <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
                ) : topPages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                    <Globe className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No page data yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topPages.slice(0, 8).map((page: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400 text-xs w-4">{i + 1}</span>
                          <span className="text-gray-700 truncate max-w-[160px]">{page.path === "/" ? "Home" : page.path}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-gray-500">{parseInt(page.visitors)} visitors</span>
                          <Badge className="bg-[#3e0d57]/10 text-[#3e0d57] text-xs hover:bg-[#3e0d57]/10">{parseInt(page.views)} views</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DETAILS TAB ── */}
        <TabsContent value="details" className="space-y-6 mt-6">

          {/* Traffic Sources Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Traffic by Source</CardTitle>
              <CardDescription>Visitor breakdown by how they found your site</CardDescription>
            </CardHeader>
            <CardContent>
              {sourcesLoading ? (
                <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
              ) : trafficSources.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No traffic data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trafficSources.map((s: any) => ({ name: SOURCE_LABELS[s.source] || s.source, visitors: parseInt(s.visitors), views: parseInt(s.views) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" fill="#3e0d57" name="Visitors" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="views" fill="#ea9999" name="Page Views" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Country + City side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visitors by Country */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Visitors by Country
                </CardTitle>
                <CardDescription>Which countries your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                {countryLoading ? (
                  <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
                ) : byCountry.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                    <MapPin className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No location data yet</p>
                    <p className="text-xs mt-1">Detected from visitor IP addresses</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {byCountry.map((c: any, i: number) => {
                      const totalVisitors = byCountry.reduce((sum: number, x: any) => sum + parseInt(x.visitors), 0);
                      const pct = totalVisitors > 0 ? Math.round(parseInt(c.visitors) / totalVisitors * 100) : 0;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{c.country}</span>
                            <span className="text-gray-500">{parseInt(c.visitors)} visitors ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-[#3e0d57]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visitors by City/Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Visitors by City / Area
                </CardTitle>
                <CardDescription>Which cities and areas your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                {cityLoading ? (
                  <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
                ) : byCity.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No city data yet</p>
                    <p className="text-xs mt-1">Detected from visitor IP addresses</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {byCity.map((c: any, i: number) => {
                      const totalVisitors = byCity.reduce((sum: number, x: any) => sum + parseInt(x.visitors), 0);
                      const pct = totalVisitors > 0 ? Math.round(parseInt(c.visitors) / totalVisitors * 100) : 0;
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="text-gray-700 font-medium">{c.city}</span>
                              <span className="text-gray-400 text-xs ml-1">({c.country})</span>
                            </div>
                            <span className="text-gray-500">{parseInt(c.visitors)} visitors ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-[#ea9999]" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Search Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Search Keywords
              </CardTitle>
              <CardDescription>
                Keywords visitors used on search engines to find your site. 
                <span className="text-amber-600 ml-1">Note: Google hides most keywords for privacy — Bing and other engines still share them. For full Google keyword rankings, use Google Search Console.</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keywordsLoading ? (
                <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
              ) : keywords.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-gray-400">
                  <Tag className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No keyword data yet</p>
                  <p className="text-xs mt-1 text-center max-w-xs">Keywords will appear when visitors arrive from Bing or other search engines that share this data</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-xs text-gray-400 font-medium pb-1 border-b">
                    <span>Keyword</span>
                    <span className="text-center">Visitors</span>
                    <span className="text-right">Page Views</span>
                  </div>
                  {keywords.map((k: any, i: number) => (
                    <div key={i} className="grid grid-cols-3 text-sm items-center py-1 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-4">{i + 1}</span>
                        <span className="text-gray-700 truncate max-w-[180px] capitalize">{k.keyword}</span>
                      </div>
                      <span className="text-center text-gray-600">{k.visitors}</span>
                      <span className="text-right">
                        <Badge className="bg-[#3e0d57]/10 text-[#3e0d57] text-xs hover:bg-[#3e0d57]/10">{k.views}</Badge>
                      </span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <ExternalLink className="w-3 h-3" />
                        View full keyword rankings in Google Search Console
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── GOOGLE TOOLS TAB ── */}
        <TabsContent value="google-tools" className="space-y-6 mt-6">

          {/* Google Analytics 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                Google Analytics 4
              </CardTitle>
              <CardDescription>
                Connect Google Analytics to get advanced insights, audience reports, and conversion tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 flex gap-3">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">How to set up Google Analytics</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">analytics.google.com</a></li>
                    <li>Create a new GA4 property for your website</li>
                    <li>Copy your Measurement ID (starts with G-)</li>
                    <li>Paste it below and click Save</li>
                  </ol>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Measurement ID</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="G-XXXXXXXXXX"
                    value={gaId || (settings as any)?.ga4_measurement_id || ""}
                    onChange={(e) => setGaId(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    onClick={() => saveSetting.mutate({ key: "ga4_measurement_id", value: gaId })}
                    disabled={saveSetting.isPending}
                    className="bg-[#3e0d57] text-white hover:bg-[#3e0d57]/90"
                  >
                    Save
                  </Button>
                </div>
                {(settings as any)?.ga4_measurement_id && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>GA4 configured — ID: {(settings as any).ga4_measurement_id}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-3 h-3" />
                    Open Analytics Dashboard
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Google Search Console */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-4 h-4 text-[#3e0d57]" />
                Google Search Console
              </CardTitle>
              <CardDescription>
                Verify your site with Google Search Console to monitor search rankings, indexing, and SEO performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 flex gap-3">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">How to verify with Search Console</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Search Console</a></li>
                    <li>Add your site URL: <code className="bg-blue-100 px-1 rounded">https://glintshades.com</code></li>
                    <li>Choose "HTML tag" verification method</li>
                    <li>Copy the content value from the meta tag</li>
                    <li>Paste it below and click Save — then click Verify in GSC</li>
                  </ol>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste verification code here"
                    value={gscCode || (settings as any)?.gsc_verification || ""}
                    onChange={(e) => setGscCode(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => saveSetting.mutate({ key: "gsc_verification", value: gscCode })}
                    disabled={saveSetting.isPending}
                    className="bg-[#3e0d57] text-white hover:bg-[#3e0d57]/90"
                  >
                    Save
                  </Button>
                </div>
                {(settings as any)?.gsc_verification && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verification code saved. Go to GSC and click Verify.</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-3 h-3" />
                    Open Search Console
                  </Button>
                </a>
                <a href={`https://glintshades.com/sitemap.xml`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-3 h-3" />
                    View Sitemap
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* SEO Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Checklist</CardTitle>
              <CardDescription>Current technical SEO status of your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Dynamic page titles on every page", done: true },
                  { label: "Meta descriptions on every page", done: true },
                  { label: "Open Graph tags for social sharing", done: true },
                  { label: "Twitter Card tags", done: true },
                  { label: "Canonical URLs to prevent duplicate content", done: true },
                  { label: "Structured data (JSON-LD) for products & organization", done: true },
                  { label: "robots.txt file", done: true },
                  { label: "XML sitemap with all pages and products", done: true },
                  { label: "Web app manifest (PWA support)", done: true },
                  { label: "Google Analytics 4", done: !!(settings as any)?.ga4_measurement_id },
                  { label: "Google Search Console verified", done: !!(settings as any)?.gsc_verification },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${item.done ? "text-green-500" : "text-gray-300"}`} />
                    <span className={`text-sm ${item.done ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
                    {!item.done && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">Action needed</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
