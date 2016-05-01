DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
nohup node ${DIR}/app.js 0<&- &> ${DIR}/log/app-`date +%s`.log &
