import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStockData, StockData } from '../services/stockApi';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { API_KEY as ALPHA_VANTAGE_API_KEY } from '../services/stockApi';
import { Briefcase, Globe, Calendar, DollarSign, TrendingUp, Info, Link as LinkIcon, BarChart2, Users } from 'lucide-react';

const FINNHUB_API_KEY = 'd1e3ff9r01qlt46scf40d1e3ff9r01qlt46scf4g';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface CompanyProfile {
  name: string;
  logo: string;
  weburl: string;
  finnhubIndustry: string;
  country: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  phone: string;
  ticker: string;
  ipoDate?: string;
  currency?: string;
  description?: string;
}

interface NewsArticle {
  headline: string;
  summary: string;
  url: string;
  datetime: number;
  source: string;
  image: string;
}

interface Financials {
  peBasicExclExtraTTM?: number;
  epsTTM?: number;
  dividendYieldIndicatedAnnual?: number;
}

interface AnalystRecommendation {
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string;
}

const TABS = ['News', 'Financials', 'Overview'];

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<StockData | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('News');

  // News
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  // Financials
  const [financials, setFinancials] = useState<Financials | null>(null);
  const [analyst, setAnalyst] = useState<AnalystRecommendation | null>(null);
  const [finLoading, setFinLoading] = useState(false);
  const [finError, setFinError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchStockData(symbol.toUpperCase()),
      axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: FINNHUB_API_KEY
        }
      })
    ])
      .then(([stockData, profileRes]) => {
        setStock(stockData);
        setProfile(profileRes.data);
      })
      .catch(() => setError('Failed to fetch stock/company data.'))
      .finally(() => setLoading(false));
  }, [symbol]);

  // Fetch news
  useEffect(() => {
    if (tab !== 'News' || !symbol) return;
    setNewsLoading(true);
    setNewsError(null);
    axios.get(`${FINNHUB_BASE_URL}/company-news`, {
      params: {
        symbol: symbol.toUpperCase(),
        from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
        token: FINNHUB_API_KEY
      }
    })
      .then(res => {
        setNews(res.data.slice(0, 8));
      })
      .catch(() => setNewsError('Failed to fetch news.'))
      .finally(() => setNewsLoading(false));
  }, [tab, symbol]);

  // Fetch financials and analyst recommendations
  useEffect(() => {
    if (tab !== 'Financials' || !symbol) return;
    setFinLoading(true);
    setFinError(null);
    Promise.all([
      axios.get(`${FINNHUB_BASE_URL}/stock/metric`, {
        params: {
          symbol: symbol.toUpperCase(),
          metric: 'all',
          token: FINNHUB_API_KEY
        }
      }),
      axios.get(`${FINNHUB_BASE_URL}/stock/recommendation`, {
        params: {
          symbol: symbol.toUpperCase(),
          token: FINNHUB_API_KEY
        }
      })
    ])
      .then(([finRes, analystRes]) => {
        setFinancials(finRes.data.metric || {});
        setAnalyst(analystRes.data[0] || null);
      })
      .catch(() => setFinError('Failed to fetch financials.'))
      .finally(() => setFinLoading(false));
  }, [tab, symbol]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>;
  if (!stock) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">No data found.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-0 mt-10 overflow-hidden backdrop-blur-md border border-gray-100 dark:border-gray-800">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-gradient-to-br from-blue-50/80 via-white/80 to-blue-100/60 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {profile?.logo && (
          <img src={profile.logo} alt="logo" className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-900 border shadow-md object-contain" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{profile?.name || stock.name}</h2>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-lg font-mono font-bold shadow-sm">{stock.symbol}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile?.finnhubIndustry && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs font-semibold"><Briefcase className="w-4 h-4" />{profile.finnhubIndustry}</span>
            )}
            {profile?.country && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold"><Globe className="w-4 h-4" />{profile.country}</span>
            )}
            {profile?.ipo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-semibold"><Calendar className="w-4 h-4" />IPO {profile.ipo}</span>
            )}
            {profile?.exchange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold"><BarChart2 className="w-4 h-4" />{profile.exchange}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold"><DollarSign className="w-4 h-4" />Price: ${stock.price.toFixed(2)}</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${stock.change >= 0 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'} text-xs font-semibold`}><TrendingUp className="w-4 h-4" />{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            {profile?.marketCapitalization && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-xs font-semibold"><Info className="w-4 h-4" />Mkt Cap: ${profile.marketCapitalization.toLocaleString()} {profile.currency}</span>
            )}
            {profile?.shareOutstanding && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 text-xs font-semibold"><Users className="w-4 h-4" />Shares: {profile.shareOutstanding.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 px-8 pt-4">
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          {TABS.map(t => (
            <button
              key={t}
              className={`py-2 px-4 -mb-px border-b-2 font-medium transition-colors duration-200 ${tab === t ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-blue-600'}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        {tab === 'Overview' && (
          <div>
            <div className="mb-4 text-gray-600 dark:text-gray-300 text-lg font-semibold flex items-center gap-2"><Info className="w-5 h-5" />Company Overview</div>
            <div className="mb-4">
              {profile?.description ? (
                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line text-base leading-relaxed">
                  {profile.description.length > 300 ? (
                    <>
                      {profile.description.slice(0, 300)}...{' '}
                      {profile.weburl && (
                        <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">Read more <LinkIcon className="w-4 h-4" /></a>
                      )}
                    </>
                  ) : profile.description}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">No company description available.</div>
              )}
            </div>
          </div>
        )}
        {tab === 'News' && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {newsLoading ? <LoadingSpinner /> : newsError ? <div className="text-red-600 dark:text-red-400">{newsError}</div> : (
              news.length === 0 ? <div className="text-gray-500 dark:text-gray-300 col-span-2">No recent news found.</div> :
              news.map((n, i) => (
                <a
                  key={i}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-all duration-200 group overflow-hidden hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 p-4">
                    {n.image && <img src={n.image} alt="news" className="w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-900" />}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">{n.headline}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{n.source} • {new Date(n.datetime * 1000).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-gray-700 dark:text-gray-200 line-clamp-3">{n.summary}</div>
                  <div className="flex items-center justify-between px-4 pb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-300">Click to read more</span>
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full text-xs font-semibold">Read</span>
                  </div>
                </a>
              ))
            )}
          </div>
        )}
        {tab === 'Financials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finLoading ? <LoadingSpinner /> : finError ? <div className="text-red-600 dark:text-red-400">{finError}</div> : (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold"><BarChart2 className="w-4 h-4" />P/E Ratio (TTM):</span>
                    <span className="font-semibold text-lg">{financials?.peBasicExclExtraTTM !== undefined ? financials.peBasicExclExtraTTM : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold"><DollarSign className="w-4 h-4" />EPS (TTM):</span>
                    <span className="font-semibold text-lg">{financials?.epsTTM !== undefined ? financials.epsTTM : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-semibold"><TrendingUp className="w-4 h-4" />Dividend Yield:</span>
                    <span className="font-semibold text-lg">{financials?.dividendYieldIndicatedAnnual !== undefined ? (financials.dividendYieldIndicatedAnnual * 100).toFixed(2) + '%' : 'N/A'}</span>
                  </div>
                </div>
                {analyst && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-1">Analyst Recommendations (latest: {analyst.period})</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs font-semibold">Buy: {analyst.buy}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs font-semibold">Hold: {analyst.hold}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs font-semibold">Sell: {analyst.sell}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 text-xs font-semibold">Strong Buy: {analyst.strongBuy}</span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs font-semibold">Strong Sell: {analyst.strongSell}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 