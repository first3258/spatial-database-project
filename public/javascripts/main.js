import Map from "https://js.arcgis.com/4.23/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.23/@arcgis/core/views/MapView.js";
import esriConfig from "https://js.arcgis.com/4.23/@arcgis/core/config.js";
import GeoJSONLayer from "https://js.arcgis.com/4.23/@arcgis/core/layers/GeoJSONLayer.js";


esriConfig.apiKey =" AAPK25acb65e74c04d7d9f90996ad240697aIAlKNbNk8vpWisgYnkAPI5KGenKx6HMygCQh00U7TGaoLciXQpw7pfS4cSNK_kZY";

async function getData() {
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const year = urlParams.get("year");
  const option = urlParams.get("option");
  console.log(option)

  if (year === null && option === null){
    const data = await axios.get("/api/getAll");
    return data.data.result;
  } else if(option === 'A') {
    const data = await axios.get(`/api/year${year}`);
    return data.data.result;
  }else if( option === 'B'){
    const data = await axios.get(`/api/option/Bangkok`);
    return data.data.result;
  }else if(option === 'D'){
    const data = await axios.get(`/api/option/mbr`);
    return data.data.result;
  }else if( option === 'C'){
    const data = await axios.get(`/api/option/nearthai`);
    return data.data.result;
  }else if (option === 'E'){
    const data = await axios.get(`/api/option/eachcountry`);
    return data.data.result;
  }else if(option === 'F'){
    const data = await axios.get(`/api/option/lowincome${year}`);
    return data.data.result;
  }
         
}

const pm25Data = await getData();
const data = await createTemplate(pm25Data);


const blob = await new Blob([JSON.stringify(data)], {
    type: "application/json",
});

const url = await URL.createObjectURL(blob);

const renderer = {
    type: "simple",
    field: "Pm25",
    symbol: {
        type: "simple-marker",
        color: [250, 250, 250],
        outline: {
            color: "white",
        },
    },
    
    visualVariables: [
        {
            type: "size",
            field: "Pm25",
            stops: [
            {
              value: 5,
              size: "5px",
            },
            {
                value: 200,
                size: "20px",
            },
        ],
    },
    {
        type: "color",
        field: "Pm25",
        stops: [
            { value: 1, color: "#3742fa" },
            { value: 10, color: "#2ed573" },
            { value: 25, color: "#ffa502" },
            { value: 35, color: "#ff6348" },
            { value: 50, color: "#ff4757" },
        ],
    },
],
};

const geojsonLayer = new GeoJSONLayer({
    url: url,
    renderer: renderer,
});

const map = new Map({
    basemap: "streets",
    layers: [geojsonLayer],
});

const view = new MapView({
    container: "viewDiv",
    map: map,
    zoom: 4,
    center: [100.505513, 13.743732],
});


async function createTemplate(result) {
    try {
      let FeatureCollection = { type: "FeatureCollection", features: [] };

      let features = {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [] },
      };

      let i = 0;

      result.map((p) => {
        Object.assign(features.properties, {
          Country: p.country,
          City: p.city,
          Year: p.Year,
          Pm25: p.pm25,
          Population: p.population,
          Wbinc16_text: p.wbinc16_text,
          Region: p.Region,
          Conc_Pm25: p.conc_pm25,
          Color_Pm25: p.color_pm25,
        });

        let x = p.geom.points[0].x;
        let y = p.geom.points[0].y;
        let xyArrays = [x, y];

        features.geometry.coordinates = xyArrays;

        FeatureCollection.features.push(features);

        features = {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [] },
        };

        xyArrays = [];

        i++;
      });

      i = 0;

      console.log(FeatureCollection)
      return FeatureCollection;
    } catch (error) {
      return [];
    }
}



