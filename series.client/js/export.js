export function exportCSV(seriesList) {
    const headers = ["ID", "Título", "Género", "Estado", "Año", "Sinopsis"];
    const rows = seriesList.map(s => [
        s.id,
        `"${(s.title || "").replace(/"/g, '""')}"`,
        `"${(s.genre || "").replace(/"/g, '""')}"`,
        s.status || "",
        s.year || "",
        `"${(s.synopsis || "").replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, "series.csv");
}

export function exportXLSX(seriesList) {
    // SpreadsheetML — formato XML que Excel y LibreOffice abren nativamente
    const rows = seriesList.map(s => `
        <Row>
            <Cell><Data ss:Type="Number">${s.id}</Data></Cell>
            <Cell><Data ss:Type="String">${escXml(s.title)}</Data></Cell>
            <Cell><Data ss:Type="String">${escXml(s.genre)}</Data></Cell>
            <Cell><Data ss:Type="String">${escXml(s.status)}</Data></Cell>
            <Cell><Data ss:Type="Number">${s.year || 0}</Data></Cell>
            <Cell><Data ss:Type="String">${escXml(s.synopsis)}</Data></Cell>
        </Row>`).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Series">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">Título</Data></Cell>
        <Cell><Data ss:Type="String">Género</Data></Cell>
        <Cell><Data ss:Type="String">Estado</Data></Cell>
        <Cell><Data ss:Type="String">Año</Data></Cell>
        <Cell><Data ss:Type="String">Sinopsis</Data></Cell>
      </Row>
      ${rows}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    triggerDownload(blob, "series.xlsx");
}

function escXml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}