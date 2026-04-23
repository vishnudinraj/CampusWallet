// ── Shared data module (all pages include this) ──

const STORAGE_KEY  = 'cw_transactions';
const GOALS_KEY    = 'cw_goals';
const BUDGETS_KEY  = 'cw_budgets';

// ── Auth ──
const SESSION_KEY = 'cw_session';

function loadUser(username) {
  try { return JSON.parse(localStorage.getItem(`cw_user_${username}`)) || null; }
  catch { return null; }
}
function saveUser(user) {
  localStorage.setItem(`cw_user_${user.username}`, JSON.stringify(user));
}

function getSession()  { return localStorage.getItem(SESSION_KEY) || null; }
function setSession(u) { localStorage.setItem(SESSION_KEY, u); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
function currentUser() { return getSession(); }

function userKey(base) {
  const u = getSession();
  return u ? `${base}_${u}` : base;
}

function logout() {
  clearSession();
  window.location.replace('login.html');
}

function migrateUserData(username) {
  if (localStorage.getItem(`cw_migrated_${username}`)) return;
  [STORAGE_KEY, GOALS_KEY, BUDGETS_KEY, 'cw_fl_read'].forEach(k => {
    const old = localStorage.getItem(k);
    const neo = `${k}_${username}`;
    if (old && !localStorage.getItem(neo)) {
      localStorage.setItem(neo, old);
      localStorage.removeItem(k);
    }
  });
  localStorage.setItem(`cw_migrated_${username}`, '1');
}

function initDefaultUsers() {
  // One-time: remove all non-admin accounts created during testing
  if (!localStorage.getItem('cw_cleanup_v1')) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('cw_user_') && k !== 'cw_user_admin')
      .forEach(k => {
        const uname = k.slice('cw_user_'.length);
        ['cw_transactions_','cw_goals_','cw_budgets_','cw_fl_read_',
         'cw_migrated_','cw_show_tutorial_','cw_tutorial_done_'].forEach(p => {
          localStorage.removeItem(p + uname);
        });
        localStorage.removeItem(k);
      });
    localStorage.setItem('cw_cleanup_v1', '1');
  }

  // Migrate old cw_users array to per-user keys (one-time)
  try {
    const oldRaw = localStorage.getItem('cw_users');
    if (oldRaw) {
      const oldArr = JSON.parse(oldRaw);
      if (Array.isArray(oldArr)) {
        oldArr.forEach(u => { if (u && u.username && !loadUser(u.username)) saveUser(u); });
      }
      localStorage.removeItem('cw_users');
    }
  } catch (e) {}

  if (!loadUser('admin')) {
    saveUser({ username: 'admin', password: 'admin', displayName: 'Carnage', createdAt: '2024-01-01' });
  }
}
initDefaultUsers();

// ── Theme ──
const THEME_KEY = 'cw_theme';

function initTheme() {
  if (localStorage.getItem(THEME_KEY) === 'dark') document.body.classList.add('dark');
  _syncThemeBtn();
}

function toggleTheme() {
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  _syncThemeBtn();
}

function _syncThemeBtn() {
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.querySelector('.tt-icon').innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    btn.querySelector('.tt-label').textContent = dark ? 'Light Mode' : 'Dark Mode';
  });
}

const CATEGORIES = [
  { name: 'Tuition',            color: '#1d4ed8', bg: '#dbeafe', emoji: '🎓' },
  { name: 'Accommodation',      color: '#b45309', bg: '#fef3c7', emoji: '🏠' },
  { name: 'Food & Dining',      color: '#1a9b7b', bg: '#e8f7f3', emoji: '🍴' },
  { name: 'Transport',          color: '#f59e0b', bg: '#fff7ed', emoji: '🚌' },
  { name: 'Health Insurance',   color: '#ef4444', bg: '#fef2f2', emoji: '💊' },
  { name: 'Visa & Fees',        color: '#3b82f6', bg: '#eff6ff', emoji: '📋' },
  { name: 'Shopping',           color: '#7c3aed', bg: '#f5f3ff', emoji: '🛍️' },
  { name: 'Entertainment',      color: '#ec4899', bg: '#fdf2f8', emoji: '🎬' },
  { name: 'Subscriptions',      color: '#6366f1', bg: '#eef2ff', emoji: '📱' },
  { name: 'Remittance',         color: '#0891b2', bg: '#ecfeff', emoji: '💸' },
  { name: 'Zakat & Charity',    color: '#059669', bg: '#ecfdf5', emoji: '🕌' },
  { name: 'Eid & Gifts',        color: '#d97706', bg: '#fffbeb', emoji: '🎁' },
  { name: 'Eid Travel',         color: '#3b82f6', bg: '#eff6ff', emoji: '✈️' },
  { name: 'Eid Celebrations',   color: '#ec4899', bg: '#fdf2f8', emoji: '🎉' },
  { name: 'Sadaqah',            color: '#059669', bg: '#ecfdf5', emoji: '📿' },
  { name: 'Iftar / Suhoor',     color: '#f59e0b', bg: '#fffbeb', emoji: '🌙' },
  { name: 'Savings Transfer',   color: '#0ea5e9', bg: '#f0f9ff', emoji: '🎯' },
];

const GOAL_ICONS = [
  { name: 'plane',      emoji: '✈️',  color: '#3b82f6', bg: '#eff6ff' },
  { name: 'gift',       emoji: '🎁',  color: '#ec4899', bg: '#fdf2f8' },
  { name: 'laptop',     emoji: '💻',  color: '#1d4ed8', bg: '#dbeafe' },
  { name: 'shield',     emoji: '🛡️', color: '#7c3aed', bg: '#f5f3ff' },
  { name: 'home',       emoji: '🏠',  color: '#f59e0b', bg: '#fff7ed' },
  { name: 'book',       emoji: '📚',  color: '#059669', bg: '#ecfdf5' },
  { name: 'car',        emoji: '🚗',  color: '#ef4444', bg: '#fef2f2' },
  { name: 'heart',      emoji: '❤️', color: '#dc2626', bg: '#fff1f2' },
  { name: 'star',       emoji: '⭐',  color: '#d97706', bg: '#fffbeb' },
  { name: 'piggy-bank', emoji: '🐷',  color: '#0891b2', bg: '#ecfeff' },
];

function getGoalIcon(name) {
  return GOAL_ICONS.find(i => i.name === name) || GOAL_ICONS[8]; // default star
}

function getCat(name) {
  return CATEGORIES.find(c => c.name === name) || { name, color: '#6b7280', bg: '#f3f4f6', emoji: '💰' };
}

function loadTxns() {
  try { return JSON.parse(localStorage.getItem(userKey(STORAGE_KEY))) || []; }
  catch { return []; }
}

function saveTxns(arr) {
  localStorage.setItem(userKey(STORAGE_KEY), JSON.stringify(arr));
}

function loadGoals() {
  try { return JSON.parse(localStorage.getItem(userKey(GOALS_KEY))) || []; }
  catch { return []; }
}

function saveGoals(arr) {
  localStorage.setItem(userKey(GOALS_KEY), JSON.stringify(arr));
}

function calcTotals(txns) {
  const todayStr = today();
  let income = 0, expenses = 0;
  txns.filter(t => t.date <= todayStr).forEach(t => {
    if (t.amount > 0) income += t.amount;
    else expenses += Math.abs(t.amount);
  });
  return { income, expenses, balance: income - expenses };
}

function fmt(n) {
  const abs = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '- ' : '') + 'AED ' + abs;
}

function fmtSigned(n) {
  const abs = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n >= 0 ? '+ AED ' : '- AED ') + abs;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Budget storage ──
function loadBudgets() {
  try { return JSON.parse(localStorage.getItem(userKey(BUDGETS_KEY))) || []; }
  catch { return []; }
}

function saveBudgets(arr) {
  localStorage.setItem(userKey(BUDGETS_KEY), JSON.stringify(arr));
}

// ── FinLearn ──
const FL_KEY = 'cw_fl_read';

const TIPS = [
  { id: 'tip01', icon: '💰', color: '#1d4ed8', bg: '#dbeafe', category: 'Budgeting',
    title: 'The 50/30/20 Rule',
    summary: 'A proven framework to split your income into needs, wants, and savings.',
    content: 'Allocate 50% of your income to needs (rent, food, transport), 30% to wants (entertainment, dining out), and 20% to savings. For UAE students on AED 3,000/month: AED 1,500 on tuition and accommodation, AED 900 on lifestyle, and AED 600 saved for future goals or emergencies.' },

  { id: 'tip02', icon: '🚇', color: '#f59e0b', bg: '#fff7ed', category: 'Transport',
    title: 'Use the Nol Card Smartly',
    summary: 'Top up your Nol card in bulk to avoid running out mid-commute.',
    content: 'In Dubai, the Nol Card is your best friend for budget transport. Load it with AED 100–200 at a time to avoid running out mid-commute. Use the RTA app to monitor your balance and trips. Monthly pass options exist for frequent commuters — compare the cost vs. pay-per-trip to see what saves more.' },

  { id: 'tip03', icon: '🍱', color: '#1a9b7b', bg: '#e8f7f3', category: 'Food',
    title: 'Meal Prep to Cut Food Costs',
    summary: 'Preparing meals in bulk can save you hundreds of AED every month.',
    content: 'Eating out daily in the UAE can cost AED 30–80 per meal. Cooking in batches (rice, proteins, and vegetables) and portioning them out cuts that to under AED 10 per meal. Visit Carrefour or LuLu Hypermarket for cost-effective groceries, and use their loyalty apps for extra discounts.' },

  { id: 'tip04', icon: '📱', color: '#6366f1', bg: '#eef2ff', category: 'Subscriptions',
    title: 'Audit Your Subscriptions',
    summary: 'Small monthly fees add up — review what you actually use.',
    content: 'Streaming services, cloud storage, gaming, and apps often charge AED 20–50/month each. List every subscription you pay for and cancel anything you haven\'t used in 30 days. Consider sharing plans with friends where available — splitting a family plan can cut costs by 50–75%.' },

  { id: 'tip05', icon: '🏦', color: '#0891b2', bg: '#ecfeff', category: 'Banking',
    title: 'Choose a Zero-Fee Student Account',
    summary: 'Many UAE banks offer free accounts for students — avoid unnecessary fees.',
    content: 'Banks like Emirates NBD, ADCB, and FAB offer student accounts with no minimum balance and zero monthly fees. Avoid accounts that charge AED 25–75/month in maintenance fees. Also check if your university has a partner bank offering on-campus ATMs to avoid withdrawal fees.' },

  { id: 'tip06', icon: '💸', color: '#0891b2', bg: '#ecfeff', category: 'Remittance',
    title: 'Send Money Home for Less',
    summary: 'Banks charge high transfer fees — use smart alternatives to send money home.',
    content: 'Bank wire transfers often charge AED 25–50 per transfer plus poor exchange rates. Instead, try apps like Wise, Remitly, or Al Ansari Exchange for much lower fees and better rates. Always compare rates before sending — a 0.5% difference on AED 2,000 saves you AED 10 per transfer.' },

  { id: 'tip07', icon: '🎯', color: '#d97706', bg: '#fffbeb', category: 'Savings',
    title: 'Set Specific Savings Goals',
    summary: 'Vague savings plans fail — attach a number and a deadline.',
    content: 'Saying "I want to save money" rarely works. Instead, set a concrete goal: "Save AED 3,000 for a flight home by December." Break it down: AED 3,000 ÷ 5 months = AED 600/month. Create a Goal in CampusWallet and add money to it each time you receive your allowance.' },

  { id: 'tip08', icon: '🛍️', color: '#7c3aed', bg: '#f5f3ff', category: 'Shopping',
    title: 'Shop During UAE Sale Seasons',
    summary: 'Time your big purchases around DSF and White Friday for major discounts.',
    content: 'Dubai Shopping Festival (January), White Friday (November), and Eid sales offer 50–70% discounts on electronics, clothes, and appliances. Plan ahead — if you need a new laptop, wait for November\'s White Friday. Sign up for store newsletters to get early access to deals.' },

  { id: 'tip09', icon: '📊', color: '#1d4ed8', bg: '#dbeafe', category: 'Budgeting',
    title: 'Track Every Dirham',
    summary: 'You can\'t manage what you don\'t measure — log expenses daily.',
    content: 'Most students who overspend are surprised by where the money went. Logging every purchase — even a AED 3 coffee — reveals patterns. After 2 weeks of tracking, you\'ll clearly see your biggest drains. Use CampusWallet\'s transaction log to record every expense the same day.' },

  { id: 'tip10', icon: '🎓', color: '#059669', bg: '#ecfdf5', category: 'Student Life',
    title: 'Use Student Discounts',
    summary: 'Your student ID unlocks discounts on transport, museums, and software.',
    content: 'UAE universities often partner with businesses for student deals. Flash your student card at Dubai Museum, Global Village (seasonal), and select restaurants. For software, Microsoft Office 365 and Adobe Creative Cloud are free or heavily discounted through most universities. Check your university\'s deals portal.' },

  { id: 'tip11', icon: '💊', color: '#ef4444', bg: '#fef2f2', category: 'Health',
    title: 'Understand Your Health Insurance',
    summary: 'Know what\'s covered before you need it — not after.',
    content: 'UAE requires all residents to have health insurance. Your university likely provides basic coverage. Know your policy: What is the co-pay per visit? Is medication covered? Are specialist visits included? Keep your insurance card in your wallet. For minor ailments, university clinics are often free.' },

  { id: 'tip12', icon: '📋', color: '#3b82f6', bg: '#eff6ff', category: 'Admin',
    title: 'Budget for UAE Visa Renewals',
    summary: 'Student visa costs are predictable — plan for them in advance.',
    content: 'Student visas in the UAE typically cost AED 1,000–1,500 to renew, depending on the emirate and visa type. These costs come annually, so divide the amount by 12 and set aside that much each month. Unexpected visa fees are a top reason students go over budget mid-year.' },

  { id: 'tip13', icon: '🌙', color: '#059669', bg: '#ecfdf5', category: 'Islamic Finance',
    title: 'Understanding Zakat on Savings',
    summary: 'If your savings exceed the Nisab for a full lunar year, Zakat may be due.',
    content: 'Zakat al-Mal is 2.5% of wealth held above the Nisab (approx. AED 22,050 in gold value) for one full lunar year. As a student, if your savings remain below this threshold, no Zakat is due. Use CampusWallet\'s Zakat calculator to check your obligation and log the payment as a transaction.' },

  { id: 'tip14', icon: '🎁', color: '#d97706', bg: '#fffbeb', category: 'Seasonal',
    title: 'Plan Eid Spending in Advance',
    summary: 'Eid gifts and celebrations can bust your budget — save ahead.',
    content: 'Eid al-Fitr and Eid al-Adha often involve gifting, new clothes, and celebrations. These costs can easily reach AED 500–2,000 if you\'re not prepared. Create an "Eid & Gifts" budget in CampusWallet a month or two before the holiday and gradually set aside money.' },

  { id: 'tip15', icon: '⚡', color: '#f59e0b', bg: '#fff7ed', category: 'Utilities',
    title: 'Cut Your Utility Bills',
    summary: 'Electricity in the UAE can spike in summer — small habits make a big difference.',
    content: 'UAE summers push AC usage up dramatically. Set your AC to 24°C instead of 20°C — each degree lower adds ~5% to your bill. Turn off appliances at the plug when not in use. If you share accommodation, split bills fairly using a simple spreadsheet or the DEWA app.' },

  { id: 'tip16', icon: '📚', color: '#059669', bg: '#ecfdf5', category: 'Student Life',
    title: 'Buy Used or Rent Textbooks',
    summary: 'New textbooks are expensive — there are smarter ways to get them.',
    content: 'Textbooks can cost AED 200–600 each. Before buying new: check your university library (many have short-term loans), ask seniors who completed the course, look on Dubizzle or Facebook Marketplace for used copies, and check if a PDF version is available legally through your university portal.' },

  { id: 'tip17', icon: '🏠', color: '#b45309', bg: '#fef3c7', category: 'Housing',
    title: 'Negotiate Your Rent',
    summary: 'In Dubai and Abu Dhabi, landlords often accept negotiations — ask.',
    content: 'If you rent privately (not in student housing), you may be able to negotiate. Offer to pay a larger number of cheques upfront — landlords prefer fewer cheques and may lower the price by 5–10%. Research average rents in the area on Bayut or Property Finder before negotiating.' },

  { id: 'tip18', icon: '🔄', color: '#0ea5e9', bg: '#f0f9ff', category: 'Savings',
    title: 'Automate Your Savings',
    summary: 'Transfer money to savings the day you receive your allowance.',
    content: 'The easiest way to save is to remove the decision entirely. As soon as your allowance arrives, immediately transfer your savings target to a separate goal or account. You\'ll naturally adapt to living on what\'s left. In CampusWallet, add money to your goals on the same day you log your income.' },

  { id: 'tip19', icon: '📉', color: '#ef4444', bg: '#fef2f2', category: 'Debt',
    title: 'Avoid Buy-Now-Pay-Later Traps',
    summary: 'BNPL services make overspending dangerously easy — use them cautiously.',
    content: 'Services like Tabby, Postpay, and Tamara split purchases into installments. This feels affordable but can lead you to buy things you can\'t really afford. The total amount owed across multiple BNPL plans can sneak up on you. Track all BNPL commitments as future expenses in your budget.' },

  { id: 'tip20', icon: '🌍', color: '#7c3aed', bg: '#f5f3ff', category: 'Travel',
    title: 'Earn Airline Miles on Everyday Spending',
    summary: 'Credit card points and airline programs can fund flights home.',
    content: 'If you have a student credit card, choose one that earns Etihad Guest or Emirates Skywards miles. Even modest spending accumulates miles over a year. Some cards offer a welcome bonus worth a one-way ticket. Always pay your balance in full each month — interest charges will far outweigh the rewards.' },
];

function loadReadTips() {
  try { return new Set(JSON.parse(localStorage.getItem(userKey(FL_KEY))) || []); }
  catch { return new Set(); }
}

function markTipRead(id) {
  const s = loadReadTips();
  s.add(id);
  localStorage.setItem(userKey(FL_KEY), JSON.stringify([...s]));
}

// Returns total AED spent matching a budget's category within its period (past only)
function getSpentForBudget(budget, txns) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return txns
    .filter(t => {
      if (t.amount >= 0) return false;
      if (t.category !== budget.category) return false;
      const d = new Date(t.date + 'T00:00:00');
      if (d > todayMidnight) return false; // exclude future
      if (budget.period === 'monthly') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (budget.period === 'weekly') {
        const mon = new Date(now);
        mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        mon.setHours(0, 0, 0, 0);
        return d >= mon;
      }
      return d >= new Date(budget.createdAt + 'T00:00:00');
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// ── Multi-currency ──
const CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham',          flag: '🇦🇪' },
  { code: 'USD', name: 'US Dollar',            flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                 flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',        flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee',         flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee',      flag: '🇵🇰' },
  { code: 'PHP', name: 'Philippine Peso',      flag: '🇵🇭' },
  { code: 'EGP', name: 'Egyptian Pound',       flag: '🇪🇬' },
  { code: 'BDT', name: 'Bangladeshi Taka',     flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee',     flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee',       flag: '🇳🇵' },
  { code: 'SAR', name: 'Saudi Riyal',          flag: '🇸🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar',        flag: '🇰🇼' },
  { code: 'QAR', name: 'Qatari Riyal',         flag: '🇶🇦' },
  { code: 'OMR', name: 'Omani Rial',           flag: '🇴🇲' },
  { code: 'BHD', name: 'Bahraini Dinar',       flag: '🇧🇭' },
  { code: 'CAD', name: 'Canadian Dollar',      flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar',    flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar',     flag: '🇸🇬' },
  { code: 'JPY', name: 'Japanese Yen',         flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan',         flag: '🇨🇳' },
  { code: 'MYR', name: 'Malaysian Ringgit',    flag: '🇲🇾' },
  { code: 'TRY', name: 'Turkish Lira',         flag: '🇹🇷' },
];

const FALLBACK_AED = {
  AED: 1,    USD: 0.2723, EUR: 0.2514, GBP: 0.2139, INR: 22.82,
  PKR: 76.05, PHP: 15.43, EGP: 13.62, BDT: 29.85,  LKR: 82.4,
  NPR: 36.5,  SAR: 1.021, KWD: 0.0836, QAR: 0.9913, OMR: 0.1047,
  BHD: 0.1026, CAD: 0.376, AUD: 0.421, SGD: 0.365,  JPY: 40.89,
  CNY: 1.982, MYR: 1.247, TRY: 9.42,
};

// ── Semester Mode ──
const SEM_KEY        = 'cw_semester';
const SEM_ALERTS_KEY = 'cw_sem_alerts';

const CITY_TEMPLATES = {
  Dubai: {
    flag: '🏙️',
    desc: 'Based on average costs for a student living in Dubai (Deira, Bur Dubai, JVC). Highest accommodation, well-connected transport.',
    monthly: [
      { category: 'Accommodation',    amount: 2200 },
      { category: 'Food & Dining',    amount: 800  },
      { category: 'Transport',        amount: 400  },
      { category: 'Health Insurance', amount: 150  },
      { category: 'Shopping',         amount: 200  },
      { category: 'Entertainment',    amount: 300  },
      { category: 'Subscriptions',    amount: 100  },
    ],
  },
  'Abu Dhabi': {
    flag: '🕌',
    desc: 'Based on average costs for a student in Abu Dhabi (Khalifa City, Al Ain corridor). Lower transport, moderate accommodation.',
    monthly: [
      { category: 'Accommodation',    amount: 1600 },
      { category: 'Food & Dining',    amount: 700  },
      { category: 'Transport',        amount: 200  },
      { category: 'Health Insurance', amount: 150  },
      { category: 'Shopping',         amount: 150  },
      { category: 'Entertainment',    amount: 250  },
      { category: 'Subscriptions',    amount: 80   },
    ],
  },
  Sharjah: {
    flag: '🌆',
    desc: 'Based on average costs for a student in Sharjah. Most affordable rent; higher transport because many students commute to Dubai.',
    monthly: [
      { category: 'Accommodation',    amount: 1000 },
      { category: 'Food & Dining',    amount: 600  },
      { category: 'Transport',        amount: 350  },
      { category: 'Health Insurance', amount: 150  },
      { category: 'Shopping',         amount: 100  },
      { category: 'Entertainment',    amount: 200  },
      { category: 'Subscriptions',    amount: 60   },
    ],
  },
};

const ALERT_TYPES = {
  tuition:   { label: 'Tuition Payment',   emoji: '🎓', color: '#1d4ed8', bg: '#dbeafe' },
  visa:      { label: 'Visa Renewal',       emoji: '📋', color: '#3b82f6', bg: '#eff6ff' },
  insurance: { label: 'Health Insurance',   emoji: '💊', color: '#ef4444', bg: '#fef2f2' },
  custom:    { label: 'Custom Reminder',    emoji: '📅', color: '#6b7280', bg: '#f3f4f6' },
};

function loadSemester()  {
  try { return JSON.parse(localStorage.getItem(userKey(SEM_KEY))) || null; } catch { return null; }
}
function saveSemester(obj) {
  localStorage.setItem(userKey(SEM_KEY), JSON.stringify(obj));
}

function loadSemAlerts() {
  try { return JSON.parse(localStorage.getItem(userKey(SEM_ALERTS_KEY))) || []; } catch { return []; }
}
function saveSemAlerts(arr) {
  localStorage.setItem(userKey(SEM_ALERTS_KEY), JSON.stringify(arr));
}

function calcSemesterHealth(sem, txns) {
  const now     = new Date();
  const start   = new Date(sem.startDate + 'T00:00:00');
  const end     = new Date(sem.endDate   + 'T00:00:00');
  const todayS  = today();

  const totalDays   = Math.max(1, (end   - start) / 86400000);
  const daysElapsed = Math.max(0, Math.min(totalDays, (now - start) / 86400000));
  const daysLeft    = Math.max(0, totalDays - daysElapsed);
  const weeklyBudget = sem.totalBudget / (totalDays / 7);

  const rangeEnd = todayS < sem.endDate ? todayS : sem.endDate;
  const spent = txns
    .filter(t => t.amount < 0 && t.date >= sem.startDate && t.date <= rangeEnd)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const remaining     = sem.totalBudget - spent;
  const idealRemaining = (daysLeft / totalDays) * sem.totalBudget;
  const rawHealth     = idealRemaining > 0 ? (remaining / idealRemaining) * 100 : (remaining >= 0 ? 100 : 0);
  const health        = Math.min(150, Math.max(0, Math.round(rawHealth)));

  const weekAgoStr = (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })();
  const weeklySpent = txns
    .filter(t => t.amount < 0 && t.date >= weekAgoStr && t.date >= sem.startDate && t.date <= rangeEnd)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const status = health >= 100 ? 'great' : health >= 80 ? 'ok' : health >= 60 ? 'warn' : 'danger';

  return {
    health, status, spent, remaining,
    weeklyBudget: Math.round(weeklyBudget),
    weeklySpent:  Math.round(weeklySpent),
    daysLeft:     Math.round(daysLeft),
    totalDays:    Math.round(totalDays),
    daysElapsed:  Math.round(daysElapsed),
    progressPct:  Math.min(100, (daysElapsed / totalDays) * 100),
  };
}

// ── Islamic Calendar (approximate Gregorian dates) ──
const RAMADAN_PERIODS = [
  { year: 2025, start: '2025-03-01', end: '2025-03-30' },
  { year: 2026, start: '2026-02-18', end: '2026-03-19' },
  { year: 2027, start: '2027-02-08', end: '2027-03-09' },
  { year: 2028, start: '2028-01-28', end: '2028-02-26' },
  { year: 2029, start: '2029-01-17', end: '2029-02-15' },
  { year: 2030, start: '2030-01-06', end: '2030-02-04' },
];

const EID_DATES = [
  { year: 2025, fitr: '2025-03-31', adha: '2025-06-07' },
  { year: 2026, fitr: '2026-03-20', adha: '2026-05-27' },
  { year: 2027, fitr: '2027-03-10', adha: '2027-05-17' },
  { year: 2028, fitr: '2028-02-27', adha: '2028-05-06' },
  { year: 2029, fitr: '2029-02-16', adha: '2029-04-26' },
  { year: 2030, fitr: '2030-02-05', adha: '2030-04-15' },
];

function getCurrentRamadan() {
  const t = today();
  return RAMADAN_PERIODS.find(p => t >= p.start && t <= p.end) || null;
}

function getNextRamadan() {
  const t = today();
  return RAMADAN_PERIODS.find(p => p.start > t) || null;
}

function getLastRamadan() {
  const t = today();
  return [...RAMADAN_PERIODS].reverse().find(p => p.end < t) || null;
}

function getUpcomingEid() {
  const t = today();
  const PRE = 56, POST = 14;
  for (const e of EID_DATES) {
    for (const [type, dateStr] of [['Al-Fitr', e.fitr], ['Al-Adha', e.adha]]) {
      const diff = (new Date(dateStr + 'T00:00:00') - new Date(t + 'T00:00:00')) / 86400000;
      if (diff >= -POST && diff <= PRE) return { type, date: dateStr, daysUntil: Math.ceil(diff) };
    }
  }
  return null;
}

function fmtIslamicDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function getAedRates() {
  try {
    const cached = JSON.parse(sessionStorage.getItem('cw_rate_cache') || 'null');
    if (cached && Date.now() - cached.fetchedAt < 1800000) return cached.rates;
    const res  = await fetch('https://open.er-api.com/v6/latest/AED');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.result !== 'success') throw new Error();
    sessionStorage.setItem('cw_rate_cache', JSON.stringify({ rates: data.rates, fetchedAt: Date.now() }));
    return data.rates;
  } catch {
    return FALLBACK_AED;
  }
}

function getCurrencyInfo(code) {
  return CURRENCIES.find(c => c.code === code) || { code, name: code, flag: '🏳️' };
}

function getHomeCurrency() {
  return localStorage.getItem(userKey('cw_home_currency')) || 'AED';
}

function setHomeCurrency(code) {
  localStorage.setItem(userKey('cw_home_currency'), code);
}

// ── Mobile sidebar ──
(function() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Sidebar overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.onclick = () => document.body.classList.remove('sidebar-open');
  document.body.appendChild(overlay);

  // Hamburger
  const burger = document.createElement('button');
  burger.className = 'hamburger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  burger.onclick = () => document.body.classList.toggle('sidebar-open');
  document.body.appendChild(burger);

  document.querySelectorAll('.sidebar .nav-item').forEach(a => {
    a.addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  });
})();
