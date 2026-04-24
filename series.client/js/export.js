export function exportXLSX(seriesList) {
    const escape = str => (str || "").toString()
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const rows = seriesList.map(s => `
        <row>
            <c t="inlineStr"><is><t>${escape(s.title)}</t></is></c>
            <c t="inlineStr"><is><t>${escape(s.genre)}</t></is></c>
            <c t="inlineStr"><is><t>${escape(s.status)}</t></is></c>
            <c><v>${s.year || ""}</v></c>
            <c t="inlineStr"><is><t>${escape(s.synopsis)}</t></is></c>
        </row>`).join("");

    const sheet = `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row>
      <c t="inlineStr"><is><t>Título</t></is></c>
      <c t="inlineStr"><is><t>Género</t></is></c>
      <c t="inlineStr"><is><t>Estado</t></is></c>
      <c t="inlineStr"><is><t>Año</t></is></c>
      <c t="inlineStr"><is><t>Sinopsis</t></is></c>
    </row>
    ${rows}
  </sheetData>
</worksheet>`;

    const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

    const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Series" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

    const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

    // Construir ZIP manualmente
    const files = {
        "[Content_Types].xml": contentTypes,
        "_rels/.rels": `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
        "xl/workbook.xml": workbook,
        "xl/_rels/workbook.xml.rels": rels,
        "xl/worksheets/sheet1.xml": sheet
    };

    const zip = buildZip(files);
    const blob = new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    triggerDownload(blob, "series.xlsx");
}

function buildZip(files) {
    const encoder = new TextEncoder();
    const parts = [];
    const centralDir = [];
    let offset = 0;

    for (const [name, content] of Object.entries(files)) {
        const nameBytes = encoder.encode(name);
        const dataBytes = encoder.encode(content);
        const header = localFileHeader(nameBytes, dataBytes);
        parts.push(header, dataBytes);
        centralDir.push(centralDirEntry(nameBytes, dataBytes, offset));
        offset += header.length + dataBytes.length;
    }

    const cdBytes = concat(centralDir);
    const eocd = endOfCentralDir(centralDir.length, cdBytes.length, offset);
    return concat([...parts, cdBytes, eocd]);
}

function crc32(data) {
    let crc = 0xFFFFFFFF;
    const table = crc32Table();
    for (let i = 0; i < data.length; i++) crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function crc32Table() {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
    }
    return t;
}

function u16(n) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
function u32(n) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }

function localFileHeader(nameBytes, dataBytes) {
    const crc = crc32(dataBytes);
    return concat([
        new Uint8Array([0x50,0x4B,0x03,0x04]), // signature
        u16(20), u16(0), u16(0),               // version, flags, compression (stored)
        u16(0), u16(0),                         // mod time, mod date
        u32(crc), u32(dataBytes.length), u32(dataBytes.length),
        u16(nameBytes.length), u16(0),
        nameBytes
    ]);
}

function centralDirEntry(nameBytes, dataBytes, offset) {
    const crc = crc32(dataBytes);
    return concat([
        new Uint8Array([0x50,0x4B,0x01,0x02]),
        u16(20), u16(20), u16(0), u16(0),
        u16(0), u16(0),
        u32(crc), u32(dataBytes.length), u32(dataBytes.length),
        u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0),
        u32(offset),
        nameBytes
    ]);
}

function endOfCentralDir(count, cdSize, cdOffset) {
    return concat([
        new Uint8Array([0x50,0x4B,0x05,0x06]),
        u16(0), u16(0),
        u16(count), u16(count),
        u32(cdSize), u32(cdOffset),
        u16(0)
    ]);
}

function concat(arrays) {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const a of arrays) { out.set(a, pos); pos += a.length; }
    return out;
}