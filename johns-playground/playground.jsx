/** @jsx React.DOM */

var SearchInputComponent = React.createClass({
    render: function() {
        return <input type="text" />;
    }
});

var SearchResultsComponent = React.createClass({
    render: function() {
        return (
            <div>
                {this.props.resultSets.map(function(resultSet) {
                    return <div>{resultSet.component({results: resultSet.results})}</div>;
                })}
            </div>
        );
    }
});

var SearchComponent = React.createClass({
    render: function() {
        return (
            <div>
                <SearchInputComponent />
                <SearchResultsComponent
                    dataSets={this.props.dataSets}
                    resultSets={this.props.resultSets} />
            </div>
        );
    }
});

var Controller = function($container, dataSets) {
    if ($container.length != 1) {
        throw Error("$container must contain a single element.");
    }

    this.component = React.renderComponent(
        <SearchComponent dataSets={dataSets} resultSets={[]} />,
        $container[0]
    );
}


var Bla = React.createClass({
    render: function() {
        return (
            <ul>
                {this.props.results.map(function(result) {
                    return <li>{result}</li>
                })}
            </ul>
        );
    }
});

var dataSets = [
    {component: Bla, name: "suggestions"},
    {component: Bla, name: "dynamic"},
]

var myController = new Controller($("#search-bar"), dataSets);
myController.setSets([{component: Bla, results: ["HI", "BOB"]}]);
