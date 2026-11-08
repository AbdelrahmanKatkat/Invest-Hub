# Quant Investing — curriculum spec

**End state:** describe factor models, backtesting, signal construction and the systematic-vs-discretionary distinction,
and recognise overfitting as the field's central risk. **Status:** Module 0 is a basic pass.

## Module 0 · Foundations  (`quant-0.html`)
| id | Lesson | Must understand | Real-world link |
|---|---|---|---|
| factor-models-intro | Factor models, briefly | Expected return modeled as a combination of exposures to a few shared factors, not a single market term alone | Multi-factor risk models used by quantitative funds |
| backtesting-basics | Backtesting basics | Splitting data into in-sample (used to build a rule) and out-of-sample (used to test it) sections | A strategy that looked great in-sample but failed out-of-sample |
| signal-construction | Signal construction | Normalising a raw measure into a comparable score (e.g. a z-score) before combining it with other signals | Ranking stocks by a standardized valuation or momentum score |
| systematic-vs-discretionary | Systematic vs. discretionary | A systematic process follows fixed, pre-defined rules; a discretionary one leaves room for judgement calls | Rules-based quant funds vs. traditional active managers |
| overfitting-risk | Overfitting risk | Too many free parameters relative to the data available makes a backtest fit noise, not a real pattern | The "more parameters than data" trap in strategy design |
