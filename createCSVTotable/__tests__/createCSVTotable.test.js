import { createElement } from 'lwc';
import CreateCSVTotable from '../createCSVTotable';

// Wait for FileReader (a macrotask) and the re-render that follows.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

async function upload(csv) {
    const element = createElement('c-create-c-s-v-totable', { is: CreateCSVTotable });
    document.body.appendChild(element);
    const input = element.shadowRoot.querySelector('lightning-input');
    const file = new File([csv], 'sample.csv', { type: 'text/csv' });
    input.dispatchEvent(new CustomEvent('change', { detail: { files: [file] } }));
    await flush();
    await flush();
    return element.shadowRoot.querySelector('lightning-datatable');
}

describe('c-create-c-s-v-totable', () => {
    afterEach(() => {
        while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    });

    it('builds columns from the header row and one row per line', async () => {
        const table = await upload('Name,Email\r\nAda,ada@example.com\nAlan,alan@example.com');
        expect(table.columns).toEqual([
            { label: 'Name', fieldName: 'Name' },
            { label: 'Email', fieldName: 'Email' },
        ]);
        expect(table.data).toEqual([
            { Name: 'Ada', Email: 'ada@example.com' },
            { Name: 'Alan', Email: 'alan@example.com' },
        ]);
    });

    it('keeps a quoted field with a comma (and an escaped quote) in one column', async () => {
        const table = await upload('Company,City\n"Acme, Inc.",Pune\n"Say ""hi""",Delhi\n');
        expect(table.data).toEqual([
            { Company: 'Acme, Inc.', City: 'Pune' },
            { Company: 'Say "hi"', City: 'Delhi' },
        ]);
    });

    // readAsText decodes UTF-8 and drops the BOM, so the first header is clean.
    it('ignores a UTF-8 BOM and skips the trailing blank line', async () => {
        const table = await upload('﻿Id,Name\n1,Ada\n');
        expect(table.columns.map((c) => c.fieldName)).toEqual(['Id', 'Name']);
        expect(table.data).toEqual([{ Id: '1', Name: 'Ada' }]);
    });

    it('does nothing when no file is chosen', async () => {
        const element = createElement('c-create-c-s-v-totable', { is: CreateCSVTotable });
        document.body.appendChild(element);
        element.shadowRoot.querySelector('lightning-input').dispatchEvent(new CustomEvent('change', { detail: { files: [] } }));
        await flush();
        expect(element.shadowRoot.querySelector('lightning-datatable').data).toEqual([]);
    });
});
