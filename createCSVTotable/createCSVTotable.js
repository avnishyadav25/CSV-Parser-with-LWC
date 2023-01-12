import { LightningElement } from 'lwc';

export default class CreateCSVTotable extends LightningElement {
    columns =[];
    data = [];
    handleCSVUpload(event) {
        const files = event.detail.files;
        //console.log("#### files = "+JSON.stringify(files));
        if (files.length > 0) {
            const file = files[0];

            // start reading the uploaded csv file
            this.read(file);
        }
    }

    async read(file) {
        try {
            const result = await this.load(file);
            //console.log("#### result = "+JSON.stringify(result));
            // execute the logic for parsing the uploaded csv file
            this.parseCSV(result);
        } catch (e) {
            this.error = e;
        }
    }

    async load(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                //console.log("#### reader.result = "+JSON.stringify(reader.result));
                resolve(reader.result);
            };
            reader.onerror = () => {
                //console.log("#### reader.error = "+JSON.stringify(reader.error));
                reject(reader.error);
            };
            //console.log("#### file = "+JSON.stringify(file));
            reader.readAsText(file);
        });
    }

    parseCSV(csv) {
        // parse the csv file and treat each line as one item of an array
        const lines = csv.split(/\r\n|\n/);
        //console.log("#### lines = "+JSON.stringify(lines));
        // parse the first line containing the csv column headers
        const headers = lines[0].split(',');
        console.log("#### headers = "+JSON.stringify(headers));
        // iterate through csv headers and transform them to column format supported by the datatable
        this.columns = headers.map((header) => {
          return { label: header, fieldName: header };
        });
        //console.log("#### this.columns = "+JSON.stringify(this.columns));
        const data = [];
        
        // iterate through csv file rows and transform them to format supported by the datatable
        lines.forEach((line, i) => {
          if (i === 0) return;
      
          const obj = {};
          const currentline = line.split(',');
      
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }
      
          data.push(obj);
        });
        //console.log("#### data = "+JSON.stringify(data));
        // assign the converted csv data for the lightning datatable
        this.data = data;
      }
}