module.exports = {
    quote: function (str) {
        return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
};