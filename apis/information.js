const request = require('request')

function Stop(StopName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(StopName),
            uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}?$filter=Stops%2Fany(d%3Ad%2FStopName%2FZh_tw%20eq%20'${Name}')%20and%20KeyPattern%20eq%20true%20&$format=JSON`,
            Route = []
        // console.log(uri)
        request(uri, (err, res, data) => {
            if (err)
                reject(err)
            else {
                data = JSON.parse(data)
                for (let i = 0; i < data.length; i++) {
                    Route.push(data[i]['RouteName']['Zh_tw'])
                }
                resolve(Route.filter((val, i, arr) => arr.indexOf(val) === i).sort())
            }
        })
    })
}


function Route(RouteName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            // uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27%20and%20KeyPattern%20eq%20true%20&$format=JSON`,
            uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27%20&$format=JSON`,
            Stops = []
        request(uri, (err, res, data) => {
            if (err || res.statusCode !== 200)
                reject(err)
            else {
                data = JSON.parse(data)
                for (let i = 0; i < data.length; i++) {
                    Stops.push({
                        'KeyPattern': data[i]['KeyPattern'],
                        'RouteName': data[i]['RouteName']['Zh_tw'],
                        'Direction': data[i]['Direction'],
                        'SubRouteUID': data[i]['SubRouteUID'],
                    })
                    Stops[i]['Stops'] = []
                    for (let j = 0; j < data[i]['Stops'].length; j++) {
                        Stops[i]['Stops'][j] = {
                            'StopName': data[i]['Stops'][j]['StopName']['Zh_tw'],
                            'StopSequence': data[i]['Stops'][j]['StopSequence'],
                            'Position': {
                                'lat': data[i]['Stops'][j]['StopPosition']['PositionLat'],
                                'lng': data[i]['Stops'][j]['StopPosition']['PositionLon']
                            }
                        }
                    }
                    Stops[i]['UpdateTime'] = data[i]['UpdateTime']
                }
                resolve(Stops)
            }
        })
    })
}

function getRouteList(City, array) {
    return new Promise((resolve, reject) => {
        if(array) {
          filter = `$filter=`
          for(var i = 0; i < array.length-1; i++) {
            filter += `RouteName%2FZh_tw%20eq%20%27${encodeURI(array[i])}%27%20or%20`
          }
          filter += `RouteName%2FZh_tw%20eq%20%27${encodeURI(array[i])}%27`
          var uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/${City}?$select=RouteName%2CDirection&${filter}&$format=JSON`
          let routelist = []
          request(uri, (err, res, data) => {
              if (err)
                  reject(err)
              else {
                  data = JSON.parse(data)
                  for (let i = 0; i < data.length; i++) {
                      routelist.push(data[i]['RouteName']['Zh_tw'] + ' ' + data[i]['Direction'])
                  }

                  resolve(routelist.filter((val, i, arr) => arr.indexOf(val) === i).sort())
              }
          })
        }
        else {
          var uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/Route/City/${City}?$select=RouteName&$format=JSON`
          let routelist = []

          request(uri, (err, res, data) => {
              if (err)
                  reject(err)
              else {
                  data = JSON.parse(data)
                  for (let i = 0; i < data.length; i++) {
                      routelist.push({
                          'RouteName': data[i]['RouteName']['Zh_tw'],
                      })
                  }
                  resolve(routelist.sort((x, y) => x.RouteName.localeCompare(y.RouteName)))
              }
          })
        }
    })
}


function EstimatedTimeOfArrival(RouteName, City, Direction) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27&$format=JSON`,
            Buses = []
        // console.log(uri)
        request(uri, (err, res, data) => {
            if (err)
                reject(err)
            else {
                data = JSON.parse(data)
                for (let i = 0; i < data.length; i++) {
                    Buses.push({
                        'StopName': data[i]['StopName']['Zh_tw'],
                        'RouteName': data[i]['RouteName']['Zh_tw'],
                        'Direction': data[i]['Direction'],
                        'EstimateTime': data[i]['EstimateTime'],
                        'SrcUpdateTime': data[i]['SrcUpdateTime'],
                        'UpdateTime': data[i]['UpdateTime'],
                        'StopSequence': data[i]['StopSequence'],
                        'SubRouteUID': data[i]['SubRouteUID'],
                    })
                }
                Buses = Buses.filter(x => x.Direction == Direction).sort((x, y) => x.StopSequence - y.StopSequence)
                resolve(Buses)
            }
        })
    })
}


function RealTimeByFrequency(RouteName, City) {
    return new Promise((resolve, reject) => {
        let Name = encodeURI(RouteName),
            uri = `http://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/${City}/${Name}?$filter=RouteName%2FZh_tw%20eq%20%27${Name}%27&$%from=JSON`,
            Buses = []
        request(uri, (err, res, data) => {
            if (err)
                reject(err)
            else {
                data = JSON.parse(data)
                for (let i = 0; i < data.length; i++) {
                    Buses.push({
                        'PlateNumb': data[i]['PlateNumb'],
                        'RouteName': data[i]['RouteName']['Zh_tw'],
                        'Direction': data[i]['Direction'],
                        'BusStatus': data[i]['BusStatus'],
                        'BusPosition': {
                            'lat': data[i]['BusPosition']['PositionLat'],
                            'lng': data[i]['BusPosition']['PositionLon'],
                        },
                        'SrcUpdateTime': data[i]['SrcUpdateTime'],
                        'UpdateTime': data[i]['UpdateTime'],
                    })
                }
                resolve(Buses)
            }
        })
    })
}

module.exports = {
    Stop,
    Route,
    EstimatedTimeOfArrival,
    RealTimeByFrequency,
    getRouteList,
}