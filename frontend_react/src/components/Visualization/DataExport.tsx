import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';

interface DataExportProps {
  data?: any[];
  chartRef?: React.RefObject<any>;
  filename?: string;
}

const DataExport: React.FC<DataExportProps> = ({ 
  data = [], 
  chartRef, 
  filename = 'argo_data' 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleClose();
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleClose();
  };

  const exportChart = () => {
    if (chartRef?.current) {
      // This would require additional implementation for specific chart libraries
      console.log('Chart export functionality would be implemented here');
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="Export Data">
        <IconButton
          onClick={handleClick}
          size="small"
          className="text-muted-foreground hover:text-primary"
        >
          <DownloadIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={exportToCSV}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={exportToJSON}>
          <ListItemIcon>
            <FileDownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={exportChart}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export Chart</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default DataExport;