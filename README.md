#TradeStation Sample Web TradingApp

The TradeStation Sample Web TradingApp is a sample app that provides an example approach to using HTML as the basis for your EasyLanguage TradingApp's user interface.


##What's a TradingApp?

A TradingApp is a Microsoft Windows based application built using TradeStation's EasyLanguage programming language. EasyLanguage is a Pascal or Delphi like programming language built exclusively for the needs of financial market traders. By developing a TradingApp, you can create a custom user experience for the financial markets. TradingApps running on the TradeStation Desktop Platform have access to the currently logged in users account, order, and position information as well as the ability to make adhoc requests for real-time and historical market data for equities, futures, forex, and options.

##What's a Web TradingApp?
A Web TradingApp is a standard TradingApp that leverages a built in Microsoft Internet Explorer web browser to render its user interface. It uses #(hastags/hashbangs) to communicate from your page into the EasyLanguage code that hosts it. From EasyLanguage, you can call your web page's javascript functions, directly, using the EasyLanguage WebBrowser control:

Example:

    var: WebBrowser web(null);

    ...

    web.Document.Invoke(JS_FUNCTION_NAME, parameter1, parameter2, etc.);

*It's important to note that javascript functions must reside in the global namespace in order for the Invoke function to work properly.*

##Getting Started

To get started, make sure you have installed TradeStation 9.5 Update 14 and download the [SAMPLEWEBTRADINGAPP-95U14.ELD](https://github.com/frankts/tradestation-web-tradingapp-sample/blob/master/SAMPLEWEBTRADINGAPP-95U14.ELD?raw=true) and import it into the TradeStation Desktop Platform, version **9.5 Update 14** or greater.

You can try the sample by launching the TradeStation Desktop Platform and selecting the File-New TradingApp Window... menu sequence. In the dialog, look for the TradingApp named "Sample Web TradingApp" and click on it to launch it. You may also launch the TradeStation Development Environment (named EasyLanguage in the same dialog) to view the source code for EasyLanguage portion of this TradingApp.

##Design considerations
When developing Web TradingApps, you should keep the following guidelines in mind:

- Your application should render at a minimum screen width: 240px
- A responsive design should be used which automatically adapts a web app to a window’s size
(TradeStation platform windows can be resized dynamically and content should adapt accordingly).
- Vertical scrolling is the preferred method of scrolling.
- Horizontal scrolling is strongly discouraged.
- Hyperlinks should be displayed as buttons or menus when driving actions rather than links. Anchors (links) should be used when referring to external resources.
- External resources should be opened outside of the TradingApp in either a platform browser
window or the operating system's default browser.
- Menus should be unobtrusive and should collapse based on responsive design principals.
- The user experience should reside within the constraints of the TradingApp window as much as possible.

If you have any questions, please join us in the [TradeStation TradingApp Store Developer Forum](https://community.tradestation.com/Discussions/Forum.aspx?Forum_ID=252).
