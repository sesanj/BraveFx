import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glossary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.css'],
})
export class GlossaryComponent {
  glossaryTerms = [
    {
      term: 'Forex (Foreign Exchange)',
      definition:
        'The global market for trading national currencies against one another. The forex market operates 24 hours a day, 5 days a week.',
    },
    {
      term: 'Pip (Point in Percentage)',
      definition:
        "The smallest price move that a given exchange rate can make. Usually, it's the fourth decimal place (0.0001) in most currency pairs.",
    },
    {
      term: 'Leverage',
      definition:
        'The ability to control a large amount of currency with a small deposit. For example, 100:1 leverage means you can control $100,000 with just $1,000.',
    },
    {
      term: 'Spread',
      definition:
        'The difference between the bid (selling) price and ask (buying) price of a currency pair. This is how brokers make money.',
    },
    {
      term: 'Margin',
      definition:
        'The amount of money required in your account to open and maintain a leveraged trading position.',
    },
    {
      term: 'Lot',
      definition:
        'A standardized trading size in forex. A standard lot is 100,000 units of the base currency.',
    },
    {
      term: 'Bull Market',
      definition:
        'A market condition where prices are rising or expected to rise. Traders who believe prices will rise are called "bulls".',
    },
    {
      term: 'Bear Market',
      definition:
        'A market condition where prices are falling or expected to fall. Traders who believe prices will fall are called "bears".',
    },
    {
      term: 'Support Level',
      definition:
        'A price level where a downtrend can be expected to pause due to a concentration of buying interest.',
    },
    {
      term: 'Resistance Level',
      definition:
        'A price level where an uptrend can be expected to pause due to a concentration of selling interest.',
    },
    {
      term: 'Technical Analysis',
      definition:
        'The study of price movements and patterns on charts to forecast future price directions.',
    },
    {
      term: 'Fundamental Analysis',
      definition:
        'Analyzing economic indicators, news events, and financial reports to predict currency movements.',
    },
    {
      term: 'Long Position',
      definition:
        'Buying a currency pair with the expectation that it will rise in value.',
    },
    {
      term: 'Short Position',
      definition:
        'Selling a currency pair with the expectation that it will fall in value.',
    },
    {
      term: 'Stop Loss',
      definition:
        'An order placed to automatically close a trade at a specific price to limit potential losses.',
    },
    {
      term: 'Take Profit',
      definition:
        'An order placed to automatically close a trade at a specific price to secure profits.',
    },
    {
      term: 'Candlestick',
      definition:
        'A type of price chart that displays the high, low, open, and closing prices of a currency pair for a specific period.',
    },
    {
      term: 'Volatility',
      definition:
        'The degree of price variation over time. High volatility means larger price swings.',
    },
    {
      term: 'Liquidity',
      definition:
        'The ease with which an asset can be bought or sold without affecting its price.',
    },
    {
      term: 'Broker',
      definition:
        'An intermediary that provides access to the forex market and executes trades on behalf of traders.',
    },
  ];
}
