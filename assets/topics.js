/* Topic registry + pipeline definitions. Add a topic here and it appears in the sidebar, search and home page.
 * Order below is the prerequisite chain: do not reorder without being asked (see CLAUDE.md). */
window.HUB = {
  repo: 'https://github.com/AbdelrahmanKatkat/Invest-Hub',
  topics: [
    {
      id: 'fundamentals', title: 'Investment Fundamentals', icon: '🧭', color: '#39c5cf', status: 'live', href: 'investment-fundamentals.html', curriculum: 'assets/curriculum-fundamentals.js', next: 'economics',
      desc: 'The vocabulary and mental models every investor needs: what investing is, time value of money, compounding, risk and return, diversification, how markets work, behavioural traps and building a first portfolio.',
      tags: ['Compounding', 'Risk & return', 'Diversification', 'Sharpe ratio', 'Asset allocation'],
      // sections/modules are generated from curriculum/investment-fundamentals.md (see assets/curriculum-fundamentals.js)
    },
    { id: 'economics', title: 'Economics (Macro & Micro)', icon: '🌐', color: '#2f81f7', status: 'soon', desc: 'Supply and demand, inflation, interest rates, GDP, central banks and the business cycle — the forces that move every market.' },
    { id: 'markets', title: 'Financial Markets', icon: '🏦', color: '#3fb950', status: 'soon', desc: 'How exchanges, order books, market makers, clearing and settlement actually work, from a market order to T+1 settlement.' },
    { id: 'assets', title: 'Asset Classes', icon: '🧱', color: '#db6d28', status: 'soon', desc: 'Equities, fixed income, cash, real estate, commodities and crypto in depth: how each is priced, what drives its return and risk.' },
    { id: 'fundamental', title: 'Fundamental Analysis', icon: '🔍', color: '#a371f7', status: 'soon', desc: 'Reading financial statements, valuation (DCF, multiples), moats and quality — figuring out what a business is worth.' },
    { id: 'technical', title: 'Technical Analysis', icon: '📈', color: '#f85149', status: 'soon', desc: 'Price and volume charts, trend, support/resistance, indicators and the evidence for and against them.' },
    { id: 'behavioral', title: 'Behavioral Finance', icon: '🧠', color: '#db61a2', status: 'soon', desc: 'Why rational markets still produce bubbles and panics: loss aversion, overconfidence, herding and how to defend against your own brain.' },
    { id: 'strategies', title: 'Investment Strategies', icon: '♟️', color: '#d29922', status: 'soon', desc: 'Value, growth, momentum, income and passive indexing — turning analysis into a repeatable, testable process.' },
    { id: 'portfolio', title: 'Portfolio Management', icon: '📦', color: '#56d364', status: 'soon', desc: 'Modern portfolio theory, asset allocation, rebalancing, tax drag and the discipline of managing a portfolio over decades.' },
    { id: 'risk', title: 'Risk & Derivatives', icon: '🛡️', color: '#f0883e', status: 'soon', desc: 'Measuring and hedging risk: volatility, drawdown, options, futures and the Greeks, without blowing up the portfolio.' },
    { id: 'global', title: 'Global & Current Events', icon: '🗞️', color: '#388bfd', status: 'soon', desc: 'Reading macro news, earnings and geopolitics as an investor: separating signal from noise in real time.' },
    { id: 'quant', title: 'Quant Investing', icon: '🧮', color: '#8957e5', status: 'soon', desc: 'Factor models, backtesting, signal construction and systematic strategies — applying statistics and code to markets.' },
  ],
};

/* Each page's pipeline: stages animate left→right. Edit text here, not in the lab code. */
window.PIPELINES = {
  hub: {
    stages: [
      { name: 'Understand', color: '#39c5cf', items: ['What is investing', 'Risk vs. return', 'Compounding'], out: 'core concepts', compute: 'Reading, worked examples', storage: 'Your notes', desc: 'Before touching a single stock, learn what investing actually is and the handful of ideas (compounding, risk, diversification) that explain almost everything else.' },
      { name: 'Analyze', color: '#2f81f7', items: ['Financial statements', 'Charts & indicators', 'Macro context'], out: 'a view on value', compute: 'Spreadsheets, screeners', storage: 'Research notes, models', desc: 'Fundamental analysis asks what something is worth; technical analysis asks what the price is doing; macro asks what the economy is doing to both.' },
      { name: 'Strategy', color: '#a371f7', items: ['Pick an approach', 'Define entry & exit rules', 'Backtest'], out: 'a written strategy', compute: 'Backtesting, paper trading', storage: 'Strategy document', desc: 'Turn analysis into a repeatable process: value, growth, momentum, income or passive — with rules you would follow even when emotional.' },
      { name: 'Build', color: '#db6d28', items: ['Asset allocation', 'Position sizing', 'Diversify'], out: 'a portfolio', compute: 'Portfolio construction tools', storage: 'Brokerage account', desc: 'Turn the strategy into actual positions sized and diversified so that no single mistake or event can do lasting damage.' },
      { name: 'Manage', color: '#db61a2', items: ['Rebalance', 'Monitor risk', 'Tax awareness'], out: 'a maintained portfolio', compute: 'Periodic review', storage: 'Trade log, statements', desc: 'A portfolio drifts from its target weights as prices move; managing it means rebalancing, watching risk and acting on a schedule, not on headlines.' },
      { name: 'Grow', color: '#3fb950', items: ['Reinvest', 'Review performance', 'Learn from mistakes'], out: 'compounded wealth', compute: 'Performance review', storage: 'Long-term track record', desc: 'Reinvested returns compound; honest review of what worked and what did not feeds back into better analysis and strategy next time.' },
    ],
  },
  fundamentals: {
    stages: [
      { name: 'Understand', color: '#39c5cf', items: ['What is investing', 'Risk vs. return', 'Compounding'], out: 'core concepts', compute: 'Reading, worked examples', storage: 'Your notes', desc: 'Before touching a single stock, learn what investing actually is and the handful of ideas (compounding, risk, diversification) that explain almost everything else.' },
      { name: 'Analyze', color: '#2f81f7', items: ['Financial statements', 'Charts & indicators', 'Macro context'], out: 'a view on value', compute: 'Spreadsheets, screeners', storage: 'Research notes, models', desc: 'Fundamental analysis asks what something is worth; technical analysis asks what the price is doing; macro asks what the economy is doing to both.' },
      { name: 'Strategy', color: '#a371f7', items: ['Pick an approach', 'Define entry & exit rules', 'Backtest'], out: 'a written strategy', compute: 'Backtesting, paper trading', storage: 'Strategy document', desc: 'Turn analysis into a repeatable process: value, growth, momentum, income or passive — with rules you would follow even when emotional.' },
      { name: 'Build', color: '#db6d28', items: ['Asset allocation', 'Position sizing', 'Diversify'], out: 'a portfolio', compute: 'Portfolio construction tools', storage: 'Brokerage account', desc: 'Turn the strategy into actual positions sized and diversified so that no single mistake or event can do lasting damage.' },
      { name: 'Manage', color: '#db61a2', items: ['Rebalance', 'Monitor risk', 'Tax awareness'], out: 'a maintained portfolio', compute: 'Periodic review', storage: 'Trade log, statements', desc: 'A portfolio drifts from its target weights as prices move; managing it means rebalancing, watching risk and acting on a schedule, not on headlines.' },
      { name: 'Grow', color: '#3fb950', items: ['Reinvest', 'Review performance', 'Learn from mistakes'], out: 'compounded wealth', compute: 'Performance review', storage: 'Long-term track record', desc: 'Reinvested returns compound; honest review of what worked and what did not feeds back into better analysis and strategy next time.' },
    ],
  },
};
