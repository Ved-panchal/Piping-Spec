import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import * as XLSX from 'xlsx';

// Type definitions
interface ReviewOutputModalProps {
  // specId: string | null;
  onClose: () => void;
  isOpen: boolean;
  data: TableDataType[];
}

interface TableDataType {
  spec: string;
  compType: string;
  shortCode: string;
  itemCode: string;
  cItemCode:string;
  itemLongDesc: string;
  itemShortDesc: string;
  size1Inch: number;
  size2Inch: number;
  size1MM: number;
  size2MM: number;
  sch1: string;
  sch2: string;
  rating: string;
  unitWt: number;
  gType: string;
  sType: string;
  skey: string;
  catRef: string;
}

const ReviewOutputModal: React.FC<ReviewOutputModalProps> = ({  
  onClose, 
  isOpen,
  data 
}) => {
  // console.log(data)
  const [projectCode,setProjectCode] = useState<string | null>(null);
  const [companyName,setCompanyName] = useState<string | null>(null);
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    setProjectCode(localStorage.getItem('projectCode'))
    setCompanyName(localStorage.getItem('companyName'));

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Review Output");
    XLSX.writeFile(workbook, "review_output.xlsx");
  };

  const columns: ColumnsType<TableDataType> = [
    {
      title: 'Spec',
      dataIndex: 'spec',
      key: 'spec',
      width: 100,
      fixed: 'left',
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Comp Type',
      dataIndex: 'compType',
      key: 'compType',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Short Code',
      dataIndex: 'shortCode',
      key: 'shortCode',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Client Item Code',
      dataIndex: 'cItemCode',
      key: 'cItemCode',
      width: 120,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Long Desc',
      dataIndex: 'itemLongDesc',
      key: 'itemLongDesc',
      width: 200,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Item Short Desc',
      dataIndex: 'itemShortDesc',
      key: 'itemShortDesc',
      width: 150,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Size 1 (Inch)',
      dataIndex: 'size1Inch',
      key: 'size1Inch',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 2 (Inch)',
      dataIndex: 'size2Inch',
      key: 'size2Inch',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 1 (MM)',
      dataIndex: 'size1MM',
      key: 'size1MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'Size 2 (MM)',
      dataIndex: 'size2MM',
      key: 'size2MM',
      width: 100,
      className: 'font-semibold text-xs',
      render: (value) => value
    },
    {
      title: 'SCH 1',
      dataIndex: 'sch1',
      key: 'sch1',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'SCH 2',
      dataIndex: 'sch2',
      key: 'sch2',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Unit Wt',
      dataIndex: 'unitWt',
      key: 'unitWt',
      width: 80,
      className: 'font-semibold text-xs',
      // render: (value) => value ? value : 0,
    },
    {
      title: 'G Type',
      dataIndex: 'gType',
      key: 'gType',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'S Type',
      dataIndex: 'sType',
      key: 'sType',
      width: 80,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'S Key',
      dataIndex: 'skey',
      key: 'skey',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    },
    {
      title: 'Cat Ref',
      dataIndex: 'catRef',
      key: 'catRef',
      width: 100,
      ellipsis: true,
      className: 'font-semibold text-xs'
    }
  ];

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadSpecFile = () => {
    if (!data.length || !projectCode) return;
    
    const currentDate = new Date();
    // const specName = data[0].spec; // Assuming all items have the same spec
    
    // Group components by spec
    const componentsBySpec = data.reduce<Record<string, TableDataType[]>>((acc, component) => {
      if (!acc[component.spec]) {
        acc[component.spec] = [];
      }
      acc[component.spec].push(component);
      return acc;
    }, {});
    
    // Generate spec file for each spec
    Object.entries(componentsBySpec).forEach(([spec, components]) => {
      // Format date for filename (YYMMDDHHMMSS)
      const dateForFilename = currentDate.toISOString().slice(2,19).replace(/[-:T]/g,'');
      
      // Format date for header (DD-MMM-YYYY HH:MM)
      const formattedDate = currentDate.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/,/g, '');
    
      let content = [
        `$* File: ${projectCode}_${spec}\`_0_${dateForFilename}.txt created at: ${formattedDate}`,
        `$* Created by Enginatrix Spec Creation tool`,
        `$* Project : ${projectCode}`,
        `$* Bolting method: NEW`,
        `$* Spec: ${spec}\` Revision: 0 (first revision transferred)`,
        `$* Rating: `, 
        ``,
        `var !module BANNER NAME`,
        `var !module (upcase('$!module'))`,
        `if (match(|$!MODULE|,|MONIT|) GT 0) then`,
        ` dev tty`,
        `endif`,
        ``,
        `if (match(|$!MODULE|,|SPECON|) LT 1) then`,
        ` SPECON`,
        `endif`,
        ``,
        `$W250`,
        `/${spec}\``,
        `handle (41,69)(17,3)(17,13)`,
        `    new SPEC /${spec}\``,
        `endhandle`,
        ``,
        `/${spec}\``,
        `:Curr-spc-iss |0|`,
        ``,
        `Var !spcoms coll all spcom with lock eq false for /${spec}\``,
        `Do !remove values !spcoms`,
        `    Remove $!remove`,
        `Enddo`,
        `Var !save coll all spcom for /${spec}\``,
        `Do !unlock values !save`,
        `    $!unlock`,
        `    unlock`,
        `Enddo`,
        ``,
        `OLD SPEC /${spec}\``,
		`BSPEC /${spec}\``,
        ``,
        `MM BORE`,
        ``,
      ].join('\n');

      let lineCounter = content.split('\n').length;
      // Process each component
      // console.log('Components', components);
      components.forEach((comp: TableDataType) => {
        const sTypeFormatted = comp.sType.length > 4 ? `TEXT '${comp.sType}'` : comp.sType;
        
        const componentBlock = [
          `HEADING`,
          `TYPE NAME PBOR0 ${comp.size2MM !== 0 ? 'PBOR3' : ''} STYP SHOP CATREF DETAIL MATXT CMPREF BLTREF`,
          `DEFAULTS`,
          `${comp.gType} */${comp.itemCode} ${comp.size1MM} ${comp.size2MM !== 0 ? comp.size2MM : ''} ${sTypeFormatted} FALSE /${comp.catRef} /${comp.itemCode}-D /${comp.itemCode}-M /${comp.itemCode}-C`,
          `    handle (17,30)(17,42)(17,44)(17,41)(17,43)(41,69)(2,109)`,
          `        $p LINE ${lineCounter + 3}: Element(s) not available for spec component */${comp.itemCode} (${comp.gType})`,
          `        $p $!!ERROR.TEXT`,
          `    elsehandle (17,51)`,
          `        HEADING`,
          `        NAME TYPE PBOR0 ${comp.size2MM !== 0 ? 'PBOR3' : ''} STYP SHOP CATREF DETAIL MATXT CMPREF BLTREF`,
          `        DEFAULTS`,
          `        - - - = = `,
          `        */${comp.itemCode} ${comp.gType} ${comp.size1MM} ${comp.size2MM !== 0 ? comp.size2MM : ''} ${sTypeFormatted} FALSE /${comp.catRef} /${comp.itemCode}-D /${comp.itemCode}-M /${comp.itemCode}-C`,
          `            handle (17,30)(17,42)(17,44)(17,41)(17,43)(41,69)(2,109)`,
          `                $p LINE ${lineCounter + 12}: Element(s) not available for spec component */${comp.itemCode} (${comp.gType})`,
          `                $p $!!ERROR.TEXT`,
          `            elsehandle (41,52)`,
          `                $p LINE ${lineCounter + 12}: The specified catalogue reference /${comp.catRef} is not of the type SCOM`,
          `                $p $!!ERROR.TEXT`,
          `            elsehandle none`,
          `                :SCHTHK ||`,
          `                handle any`,
          `                    $p LINE ${lineCounter + 20}: Could not assign attribute :SCHTHK`,
          `                    $p $!!ERROR.TEXT`,
          `                endhandle`,
          `            endhandle`,
          `    elsehandle (41,52)`,
          `        $p LINE ${lineCounter + 3}: The specified catalogue reference /${comp.catRef} is not of the type SCOM`,
          `        $p $!!ERROR.TEXT`,
          `    elsehandle none`,
          `        :SCHTHK ||`,
          `        handle any`,
          `            $p LINE ${lineCounter + 30}: Could not assign attribute :SCHTHK`,
          `            $p $!!ERROR.TEXT`,
          `        endhandle`,
          `    elsehandle any`,
          `        $p LINE ${lineCounter + 3}: error importing specification`,
          `        RETURN ERROR 1 |$!!ERROR.TEXT|`,
          `    endhandle`
        ].join('\n');
    
        content += '\n' + componentBlock;
        lineCounter += componentBlock.split('\n').length;
      });
    
      // Add footer
      const footer = [
        '',
        '$P Spec Updated',
        '$P Please check the limbo spec for any deleted components',
        '$.'
      ].join('\n');
    
      content += '\n' + footer;
      
      // Download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectCode}_${spec}_0_${dateForFilename}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const handleDownloadWeightFile = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/,/g, '');
    
    const dateForFilename = currentDate.toISOString().slice(0,10).replace(/-/g,'');
    
    const header = `$* File: ${projectCode}_propcon_${dateForFilename}.txt created at: ${formattedDate}
$* Created by Enginatrix Spec Creation Tool
$* Project : ${projectCode}
$* Client: ${companyName}
var !module BANNER NAME
var !module (upcase('$!module'))
if (match(|$!MODULE|,|MONIT|) GT 0) then
 dev tty
endif
   
if (match(|$!MODULE|,|PROPCON|) LT 1) then
 PROPCON
endif
   
$W250
   
MM BORE
   
MM DIST
   
/${projectCode}_PROPCON_CMPW
handle (41,69)
  new CMPW /${projectCode}_PROPCON_CMPW
endhandle
 
/${projectCode}_PROPCON_CMPW/CMPD
handle (41,69)
  new CMPT /${projectCode}_PROPCON_CMPW/CMPD
endhandle

/${projectCode}_PROPCON_CMPW/TUBD
handle (41,69)
  new CMPT /${projectCode}_PROPCON_CMPW/TUBD
endhandle\n\n
`;
  
    const itemContent = data.map(item => {
      const isPipe = item.compType.toUpperCase() === 'PIPE';
    const cmpType = isPipe ? 'TUBD' : 'CMPD';
      
    return `/${item.itemCode}-C
handle (41,69)
   /${projectCode}_PROPCON_CMPW/${isPipe ? 'TUBD' : 'CMPD'} new ${cmpType} /${item.itemCode}-C
endhandle
${isPipe ? 'UWEI':'CWEI'} ${item.unitWt == 0.00 ? 0 : item.unitWt}`;
    }).join('\n\n');
  
    const footer = '\n\n$P Weights Imported\n$.';
  
    const content = header + itemContent + footer;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectCode}_propcon_${dateForFilename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
 

  const handleDownloadDetailFile = () => {
    const detailContent = data.map(item => {
      return `/${item.itemCode}-D
handle (41,69)
  /${projectCode}_SPECGEN_DESCRIPTIONS/SDTE new SDTE /${item.itemCode}-D
endhandle
RTEXT ('${item.itemLongDesc}')
STEXT ('')
TTEXT ('')
SKEY  ${item.skey ? "'"+item.skey+"'":"''"}
/${item.itemCode}-M
handle (41,69)
  /${projectCode}_SPECGEN_DESCRIPTIONS/SMTE new SMTE /${item.itemCode}-M
endhandle
XTEXT ('')
YTEXT ('')
ZTEXT ('')
`;
        }).join('\n\n');

        const header = `$* File: ${projectCode}_paragon_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.txt
$* Created by Enginatrix Spec Creation Tool
$* Project : ${projectCode}
$* Client: ${companyName}
$* Description Format: Standard Descriptions
var !module BANNER NAME
var !module (upcase('$!module'))
if (match(|$!MODULE|,|MONIT|) GT 0) then
 dev tty
endif
 
if (match(|$!MODULE|,|PARAGON|) LT 1) then
 PARAGON
endif
 
$W250
 
MM BORE
 
MM DIST

/${projectCode}_TEXT_CATA
handle (41,69)
  new CATA /${projectCode}_TEXT_CATA
endhandle

/${projectCode}_TEXT_CATA/SDTE
handle (41,69)
  new SECT /${projectCode}_TEXT_CATA/SDTE
endhandle

/${projectCode}_TEXT_CATA/SMTE
handle (41,69)
  new SECT /${projectCode}_TEXT_CATA/SMTE
endhandle\n\n
`;

        const footer = '\n\n$P Descriptions Imported\n$.';

        downloadTextFile(header + detailContent + footer, 'detail_data.txt');
      };

  if (!isOpen) return null;
  
    return (
      <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-[98vw] max-w-[100vw] max-h-[90vh] overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Review Output</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Download className="mr-2" size={20} />
              Export to Excel
            </button>
            <button
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>
  
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content', y: 'calc(90vh - 250px)' }} // keep horizontal scroll
          size="small"
          bordered
          tableLayout="auto"   // changed from 'fixed' to 'auto'
          className="w-full"
          rowKey={(record) => record.itemCode}
          pagination={false}
        />
  
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleDownloadSpecFile}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="mr-2" size={16} />
            Download Spec File
          </button>
          <button
            onClick={handleDownloadWeightFile}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="mr-2" size={16} />
            Download Weight File
          </button>
          <button
            onClick={handleDownloadDetailFile}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="mr-2" size={16} />
            Download Detail File
          </button>
        </div>
      </div>
    </div>
    );
};

export default ReviewOutputModal;