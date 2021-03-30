
var isset = function(variable)
{
    if (typeof variable !== 'undefined' && variable != 'null' && variable != null) {
      return true
    }
    return false;
}
