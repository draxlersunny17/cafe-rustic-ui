import MuiTooltip from "@mui/material/Tooltip";


export default function ImagePreview({ src }) {
    if (!src) return <span className="text-gray-400">—</span>;
    return (
      <MuiTooltip
        title={
          <img src={src} alt="preview" className="max-h-64 max-w-64 rounded-lg" />
        }
        arrow
      >
        <img
          src={src}
          alt="thumb"
          className="w-12 h-12 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
        />
      </MuiTooltip>
    );
  };