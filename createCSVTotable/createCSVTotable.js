import { LightningElement } from 'lwc';

// Split one CSV line on commas, keeping "quoted, values" together and turning "" into ".
// shortcut: a quoted value that spans several lines is not supported; use Papa Parse for that.
function splitCSVLine(line) {
    const fields = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else field += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === ',') { fields.push(field); field = ''; }
        else field += ch;
    }
    fields.push(field);
    return fields;
}

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
        // (blank lines, such as the one after a trailing newline, are skipped)
        const lines = csv.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        //console.log("#### lines = "+JSON.stringify(lines));
        // parse the first line containing the csv column headers
        const headers = splitCSVLine(lines[0]);
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
          const currentline = splitCSVLine(line);
      
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