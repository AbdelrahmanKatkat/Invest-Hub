# Investment Fundamentals — curriculum spec

Source of truth for what each lesson must cover. Generate the site data file after editing this file:
`node tools/gen-curriculum.js fundamentals` (writes `assets/curriculum-fundamentals.js`).

**End state:** a graduate of this path can explain what investing is and why returns compound, read the basic vocabulary of
every major asset class, compute and interpret return, risk and risk-adjusted return, explain why diversification lowers
risk without lowering expected return proportionally, recognise the main behavioural traps, and build and explain a simple,
diversified first portfolio. It is the shared foundation for every deeper path that follows (Economics, Financial Markets,
Asset Classes, Fundamental Analysis, Technical Analysis, Behavioral Finance, Investment Strategies, Portfolio Management,
Risk & Derivatives, Global & Current Events, Quant Investing) — each of those goes deep on one slice of this map.

**Status:** All 5 modules (`investment-fundamentals-0.html` … `-4.html`, 33 lessons) are authored to the deep-pass
standard — see `CLAUDE.md` "where things stand".

## Module 0 · Fundamentals  (`investment-fundamentals-0.html`)
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| intro | Introduction | What investing is (deferring spending to own assets that may grow or pay income); why returns compound over time; risk vs. return as the central trade-off; investing vs. saving vs. speculating | A savings account vs. a diversified index fund over 30 years; why "time in the market" is repeated so often |
| asset-classes-overview | Asset classes overview | The main categories — cash & equivalents, bonds, equities, real estate, commodities, cryptocurrencies — and the rough risk/return/liquidity ordering between them | S&P 500 (equities), a 10-year Treasury note (bonds), a money-market fund (cash), a REIT (real estate) |
| time-value-of-money | Time value of money | A dollar today is worth more than a dollar later; present value and future value; the discount rate as the price of waiting | Why a lottery's "$1,000,000" advertised prize is paid as a smaller lump sum or an annuity; loan and mortgage pricing |
| measuring-return | Measuring return | Simple (holding-period) return; multi-period return via compounding; CAGR as the single annual rate that reproduces a multi-year outcome | Comparing a stock's 5-year total return to a bond fund's using CAGR; fund fact sheets quoting "annualised return" |
| risk-and-volatility | Risk & volatility | Standard deviation of returns as a measure of risk; why risk and expected return move together historically; downside risk is not fully captured by standard deviation alone | Volatility (σ) reported for an ETF; comparing a utility stock's volatility to a small-cap growth stock's |
| risk-adjusted-return | Risk-adjusted return | The Sharpe ratio: excess return per unit of risk; why a higher return is not automatically "better" once risk is accounted for | Fund comparisons that report Sharpe ratio alongside raw return; choosing between two funds with similar returns but different volatility |
| diversification | Diversification & correlation | Correlation between two assets' returns; portfolio variance formula for two assets; why combining imperfectly correlated assets lowers risk without lowering the weighted-average expected return | A 60/40 stocks/bonds portfolio; adding international stocks or bonds to a US-only portfolio |
| how-markets-work | How markets work | Market participants (retail investors, institutions, market makers); order types (market, limit); bid-ask spread; what an index represents | Placing a limit order vs. a market order at a broker; the S&P 500 and Nasdaq Composite as indices |
| behavioral-biases | Behavioral biases | Loss aversion, overconfidence, herding and recency bias; why they lead to buying high and selling low; simple defenses (rules, automation, diversification) | Panic selling during a market downturn; chasing a stock after a big run-up; dollar-cost averaging as a bias-resistant rule |
| first-portfolio | Building your first portfolio | Translating risk tolerance and time horizon into an asset allocation; combining the module's ideas (return, risk, diversification, behaviour) into one worked allocation | A simple two- or three-fund portfolio (broad stock index, broad bond index, cash) sized to a stated goal and horizon |

## Module 1 · Markets & Trading Mechanics  (`investment-fundamentals-1.html`) — planned
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| order-types | Order types in depth | Market, limit, stop and stop-limit orders; when each is used and its risk | Stop-loss orders during a fast-moving sell-off |
| spreads-liquidity | Bid-ask spread & liquidity | How the spread is a trading cost; liquidity vs. volume; slippage | Wide spreads on thinly-traded small-cap stocks |
| exchanges-indices | Exchanges & indices | Primary vs. secondary markets; how an index is constructed and weighted (price- vs. cap-weighted) | NYSE vs. Nasdaq; Dow Jones (price-weighted) vs. S&P 500 (cap-weighted) |
| brokers-accounts | Brokers & account types | Brokerage vs. retirement accounts; cash vs. margin accounts; custody | A taxable brokerage account vs. a tax-advantaged retirement account |
| clearing-settlement | Clearing & settlement | What happens between a trade and ownership; settlement cycles | T+1 settlement in US equities |
| market-hours | Market hours & circuit breakers | Regular vs. extended hours trading; why circuit breakers exist | A market-wide circuit breaker halt |

## Module 2 · Asset Classes in Depth  (`investment-fundamentals-2.html`) — planned
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| equities-deep | Equities in depth | Common vs. preferred stock; dividends; shareholder rights | Dividend-paying blue chips vs. non-dividend growth stocks |
| bonds-yield | Bonds & yield | Coupon, face value, yield to maturity; the inverse price/yield relationship | A central bank rate hike repricing existing bonds |
| cash-money-market | Cash & money market | Money-market funds, T-bills, CDs; the trade-off of near-zero risk and near-zero real return | A money-market fund during a high-interest-rate period |
| real-estate | Real estate & REITs | Direct ownership vs. REITs; income vs. appreciation | A publicly-traded REIT index fund |
| commodities | Commodities | Spot vs. futures pricing basics; why commodities are used as an inflation hedge | Gold and oil as commonly held commodities |
| crypto | Cryptocurrencies | What a cryptocurrency is at a high level; extreme volatility; speculative vs. investment framing | Bitcoin's historical volatility compared to equities |
| funds-etfs | Mutual funds & ETFs | Active vs. passive, expense ratios, how an ETF is created/redeemed | A broad-market index ETF vs. an actively managed mutual fund |

## Module 3 · Valuation Basics  (`investment-fundamentals-3.html`) — planned
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| balance-sheet | Reading a balance sheet | Assets, liabilities, equity; what solvency means | A company's reported debt-to-equity ratio |
| income-statement | Reading an income statement | Revenue, margins, net income | Comparing gross vs. net margin across two companies |
| multiples | P/E and other multiples | Price-to-earnings, price-to-book; what a multiple is relative to | Comparing P/E across companies in the same industry |
| dcf-intro | Intro to discounted cash flow | Discounting projected cash flows to a present value | Why growth assumptions dominate a DCF's output |
| chart-reading-intro | Intro to chart reading | Candlesticks, trend lines, support/resistance at a beginner level | Identifying an uptrend vs. a downtrend on a price chart |

## Module 4 · Portfolio Basics & Capstone  (`investment-fundamentals-4.html`) — planned
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| allocation-models | Asset allocation models | Age/horizon-based rules of thumb and their limits | A "110 minus age in stocks" rule and its critiques |
| rebalancing | Rebalancing | Why drift happens and how periodic or threshold rebalancing restores the target | Annual rebalancing of a target-date fund |
| dollar-cost-averaging | Dollar-cost averaging | Investing a fixed amount on a schedule; what it does and does not protect against | Automatic monthly contributions to a retirement account |
| taxes-fees | Taxes & fees basics | Expense ratios, tax-advantaged accounts, capital gains basics | Comparing a 0.03% index fund fee to a 1% actively managed fund fee over decades |
| capstone | Capstone: build and defend a portfolio | Combine allocation, diversification, cost and behaviour into one allocation with a written rationale | Presenting a sample portfolio for a stated goal, horizon and risk tolerance |

## Lesson template
Each row becomes one `<section class="lesson" id="ID" data-lesson>` following the standard in `AUTHORING.md`: the question,
intuition, worked example(s), formal definition with a symbol table, a lab with "try this", common traps, "where it shows up
in real investing", three self-check questions, and takeaways.

## Content standards
- Every number in a worked example or check-yourself answer is computed and verified before writing it down.
- Every claim about "what historically happens" is hedged (e.g. "has tended to", "in the data shown here") and never stated
  as a guarantee about the future.
- No lesson recommends buying, selling or holding a specific real security; examples use named *categories* or historical,
  clearly-dated illustrations.
- Terminology is introduced once, in the earliest lesson that needs it, and reused consistently afterwards.
