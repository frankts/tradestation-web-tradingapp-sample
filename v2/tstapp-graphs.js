  var accountsLoaded = false;
  var ordersLoaded = false;
  var positionsLoaded = false;

  function drawAccounts() {
    if(window.isOldIE != null || accountsLoaded == false)
      return;

    var items = TradingApp.Accounts.items();
    var arrData = [];

    arrData.push(['Account', 'Realized P/L', 'Unrealized P/L', 'Type','Purchasing Power']);

    for(var x = 0; x < items.length; x++)
    {
     var item = items[x];

     if(item['AccountID'] != null && item['RTRealizedPL'] != null && item['RTUnrealizedPL'] != null && item['Type'] != null && item['RTPurchasingPower'] != null)
      arrData.push([item.AccountID, item.RTRealizedPL, item.RTUnrealizedPL, item.Type, item.RTPurchasingPower]);
    } 

    var data = google.visualization.arrayToDataTable(arrData);

    var options = {
      title: 'Accounts - Realized vs Unrealized - Purchasing Power',
      hAxis: {title: 'Unrealized P/L'},
      vAxis: {title: 'Realized P/L'},
      bubble: {textStyle: {fontSize: 11}}
    };

    var chart = new google.visualization.BubbleChart(document.getElementById('accounts_chart_div'));
    chart.draw(data, options);
  };

  function drawOrders() {
    if(window.isOldIE != null || ordersLoaded == false)
      return;

    var container = document.getElementById('orders_chart_div');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'Action' });
    dataTable.addColumn({ type: 'string', id: 'Symbol' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    var items = TradingApp.Orders.items();
    var arrData = [];

    if(items.length == 0)
      arrData.push(["No trades placed", "None", new Date(0, 0, 0), new Date(0, 0, 0)]);


    for(var x = 0; x < items.length; x++)
    {
      var item = items[x];

      if(item['EnteredTime'] != null && item['Action'] != null && item['Symbol'] != null)
      {
        var Entered = new Date(Date.parse(item.EnteredTime));
        var Filled = new Date(Date.parse(item.EnteredTime));

        arrData.push([item.Action, item.Symbol, new Date(0, 0, 0, Entered.getHours(), Entered.getMinutes(), Entered.getSeconds()), new Date(0, 0, 0, Filled.getHours(), Filled.getMinutes(), Filled.getSeconds())]);
      }
    } 

    dataTable.addRows(arrData);

    var options = {
      timeline: { colorByRowLabel: true },
      tooltip: { trigger: 'none' }  
    };

    chart.draw(dataTable, options);

      // Workaround for IE tooltip issue.
      $('g').unbind("hover").hover(function(ev){ return false;});
  };

  function drawPositions() {
    if(window.isOldIE != null || positionsLoaded == false)
      return;

    var items = TradingApp.Positions.items();

    if (items.length > 0)
    {
      var arrData = [['Symbol', 'Open P/L']];

      for(var x = 0; x < items.length; x++)
      {
        var item = items[x];

        if(item['Symbol'] != null && item['OpenPL'] != null)
          arrData.push([items[x].Symbol, items[x].OpenPL]);
      }      

      var data = google.visualization.arrayToDataTable(arrData);

      var options = {
        title: 'Current positions',
        vAxis: {title: 'Symbol',  titleTextStyle: {color: 'blue'}}

      };

      var chart = new google.visualization.BarChart(document.getElementById('positions_chart_div'));
      chart.draw(data, options);
    }
  };

  if(window.isOldIE == null)
  {
    google.load("visualization", "1", {packages:["corechart"]});
    google.load("visualization", "1", {packages:["timeline"]});
  }

  $(window).resize(function() {
      if(accountsLoaded)
        drawAccounts();

      if(ordersLoaded)
        drawOrders();

      if(positionsLoaded)
        drawPositions();
  });


