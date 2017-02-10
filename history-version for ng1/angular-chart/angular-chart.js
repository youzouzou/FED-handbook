'use strict';

angular.module('angularChart', [])
  .directive('angularchart',

    function () {

      var c3 = window.c3;

      return {
        restrict: 'EA',
        scope: {
          dataset: '=',
          options: '='
        },
        // controller: ['$scope', '$element', '$attrs',
        //   function ($scope, $element, $attrs) {
        //     console.log('controller', $scope, $element, $attrs);
        //   }
        // ],

        link: function (scope, element, attrs) {

          scope.options = scope.options ? scope.options : {};
          scope.chart = null;
          scope.configuration = {
            data: {
              keys: {
                value: []
              },
              types: {}
            },

            axis: {
              x: {
                tick: {}
              }
            }
          };


          // add unique identifier for each chart
          //
          scope.addIdentifier = function () {
            scope.options.dataAttributeChartID = 'chartid' + Math.floor(Math.random() * 1000000001);
            angular.element(element).attr('id', scope.options.dataAttributeChartID);
            scope.configuration.bindto = '#' + scope.options.dataAttributeChartID;
          };

          // reload the charts data
          //
          scope.loadChart = function () {
            scope.chart.load(
              scope.configuration.data
            );
          };

          // generate or update chart with options
          //
          scope.updateChart = function () {

            // Add data
            if (!scope.dataset || !scope.dataset.records) {
              console.error('No data provided.');
            } else {
              scope.configuration.data.json = scope.dataset.records;
            }


            // Add lines
            //
            if (!scope.options.rows) {
              console.error('The rows to display have to be defined.');
            } else {
              scope.options.rows.forEach(function (element) {
                // TODO exists check? ERROR
                scope.configuration.data.keys.value.push(element.name);

                if (element.type) {
                  // TODO valid type ERROR
                  scope.configuration.data.types[element.name] = element.type;
                }
              });
            }

            // Add x-axis
            //
            if (!scope.options.xAxis || !scope.options.xAxis.name) {
              console.error('no xAxis provided');
            } else {
              scope.configuration.data.keys.x = scope.options.xAxis.name;
              if (scope.options.xAxis.displayFormat) {
                scope.configuration.axis.x.tick.format = scope.options.xAxis.displayFormat;
              }

              // is Datetime?
              scope.dataset.schema.forEach(function (element) {
                if (element.name === scope.options.xAxis.name) {
                  if (element.type === 'datetime') {
                    if (!element.format) {
                      return console.error('For data of the type "datetime" a format has to be defined.');
                    }
                    scope.configuration.axis.x.type = 'timeseries';
                    scope.configuration.data.x_format = element.format;
                  } else if (element.type === 'string') {
                    scope.configuration.axis.x.type = 'category';
                  }
                  return;
                }
              });
            }

            scope.chart = c3.generate(scope.configuration);
          };

          // watcher of changes in options
          //
          scope.startOptionsWatcher = function () {
            scope.$watch('options', function (newValue, oldValue) {
              if (newValue === oldValue) { // skip the first run of $watch
                return;
              }
              scope.updateChart();
            }, true); // checks for changes inside options
          };

          // watcher of changes in options
          //
          scope.startDatasetWatcher = function () {
            scope.$watch('dataset.records', function (newValue, oldValue) {
              if (newValue === oldValue) { // skip the first run of $watch
                return;
              }
              scope.loadChart();
            }, true); // checks for changes inside data

            scope.$watch('dataset.schema', function (newValue, oldValue) {
              if (newValue === oldValue) { // skip the first run of $watch
                return;
              }
              scope.updateChart();
            }, true); // checks for changes inside data
          };


          // startup
          scope.addIdentifier();
          scope.updateChart();
          scope.startOptionsWatcher();
          scope.startDatasetWatcher();
        }
      };
    }
);