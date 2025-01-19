import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { determineColorClass } from '../../helpers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { TextareaAutosize } from '@mui/material';

interface Page {
  id: string;
  name: string;
  tags: string[];
  image_link: string;
  annotated_image_link: string;
  locale: any;
}

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { editor, onReady } = useFabricJSEditor();
  const [page, setPage] = useState<Page>();
  const [locale, setLocale] = useState('');
  const [seeLocaleInJson, setSeeLocaleInJson] = useState(false);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`/api/v1/page/${id}`);
      setPage(response.data.data);
      setLocale(response.data.data.locale);
    } catch (error) {
      toast.error('Error fetching page');
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const handleBack = () => {
    navigate(`/`);
  };

  const addBackground = () => {
    if (!editor || !fabric) {
      return;
    }

    fabric.Image.fromURL(
      page?.image_link,
      (image: any) => {
        image.set({
          scaleX: editor.canvas.width / image.width,
          scaleY: editor.canvas.height / image.height,
        });
        editor.canvas.setBackgroundImage(
          image,
          editor.canvas.renderAll.bind(editor.canvas)
        );
      },
      { crossOrigin: 'anonymous' }
    );
  };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.setHeight(700);
    editor.canvas.setWidth(400);
    addBackground();
    editor.canvas.renderAll();
  }, [editor?.canvas.backgroundImage]);

  const handleAddText = () => {
    const text = new fabric.Textbox('Edit me', {
      left: 50,
      top: 50,
      width: 200,
      fontSize: 20,
      fill: '#000',
      backgroundColor: 'rgba(255, 255, 0, 0.8)',
      textAlign: 'center',
    });
    editor.canvas.add(text);
  };

  const handleClear = () => {
    editor.canvas._objects.splice(0, editor.canvas._objects.length);
    editor.canvas.renderAll();
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const dataUrl = editor.canvas.toDataURL({ format: 'png' });
    const byteString = atob(dataUrl.split(',')[1]); // Decode base64 string (remove data URL header)
    const mimeType = 'image/png'; // Define the MIME type
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeType });

    if (blob && page) {
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('pagename', page.name);
      formData.append('id', page.id);

      try {
        const response = await axios.post(
          `/api/v1/page/save-annotated-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (response.data.success === true) {
          toast.success('Image uploaded successfully!');
        } else {
          if (response.data.error) {
            toast.error(response.data.error);
          }
        }
      } catch (error) {
        toast.error('Error uploading image.');
      }
    }
    handleBack();
  };

  const handleSaveLocale = async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      const response = await axios.put(`/api/v1/page/${id}/locale`, {
        locale: locale,
      });
      if (response.data.success === true) {
        toast.success('Locale saved successfully!');
      } else {
        if (response.data.error) {
          toast.error(response.data.error);
        }
      }
    } catch (error) {
      toast.error('Error saving locale.');
    }
    handleBack();
  };

  return (
    <div className="container mt-4 mx-auto">
      <div className="flex justify-end my-4 gap-2">
        <Button
          size="medium"
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          sx={{
            textTransform: 'none',
          }}
          onClick={handleBack}
        >
          Back
        </Button>
      </div>
      <table className="min-w-full bg-white border-2 border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border-2">ID</th>
            <th className="py-2 px-4 border-2">Page</th>
            <th className="py-2 px-4 border-2">Image</th>
            <th className="py-2 px-4 border-2">Data</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-2">{page?.id}</td>
            <td className="py-2 px-4 border-2">
              <div className="text-2xl font-bold">{page?.name}</div>
              <div className="flex justify-center items-center">
                <div className="flex space-x-2 mt-3 text-xs">
                  {page?.tags?.map((tag, index) => {
                    return (
                      <span
                        key={index}
                        className={`px-2 py-1 text-white rounded-full ${determineColorClass(tag)}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </td>
            <td className="py-2 px-4 border-2">
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-center items-center gap-2">
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      sx={{
                        textTransform: 'none',
                      }}
                      onClick={handleAddText}
                    >
                      Add Annotation
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={<ClearIcon />}
                      sx={{
                        textTransform: 'none',
                      }}
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      sx={{
                        textTransform: 'none',
                      }}
                      onClick={handleSave}
                    >
                      Save Image
                    </Button>
                  </div>
                  <FabricJSCanvas className="border-2" onReady={onReady} />
                </div>
              </div>
            </td>

            <td className="py-2 px-4 border-2">
              <div className="flex flex-col justify-center items-center gap-2 border rounded-lg py-4 px-4">
                <label
                  className="mr-auto text-gray-700 text-sm font-bold"
                  htmlFor="locale"
                >
                  Existing Locale:
                </label>
                <FormControlLabel
                  sx={{ display: 'block' }}
                  control={
                    <Switch
                      checked={seeLocaleInJson}
                      onClick={() => setSeeLocaleInJson(!seeLocaleInJson)}
                      name="loading"
                      color="primary"
                    />
                  }
                  label="View Locale in JSON"
                />

                {seeLocaleInJson ? (
                  <span className="text-gray-700 text-sm border p-4">
                    {page?.locale}
                  </span>
                ) : (
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-1 px-2 border-2">Name</th>
                        <th className="py-1 px-2 border-2">ID</th>
                        <th className="py-1 px-2 border-2">EN</th>
                        <th className="py-1 px-2 border-2">VN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page?.locale &&
                        JSON.parse(page?.locale).map(
                          (subItem: any, index: number) => (
                            <tr key={index}>
                              <td className="py-1 px-2 border-2">
                                {subItem.name}
                              </td>
                              <td className="py-1 px-2 border-2">
                                {subItem.values.id}
                              </td>
                              <td className="py-1 px-2 border-2">
                                {subItem.values.en}
                              </td>
                              <td className="py-1 px-2 border-2">
                                {subItem.values.vn}
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="flex flex-col justify-center items-center gap-2 mt-10 border rounded-lg p-4">
                <label
                  className="mr-auto text-gray-700 text-sm font-bold mb-2"
                  htmlFor="locale"
                >
                  New Locale:
                </label>
                <TextareaAutosize
                  minRows={3}
                  placeholder="Locale string in JSON"
                  id="locale"
                  name="locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderColor: '#d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#374151',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
                    outline: 'none',
                  }}
                  required
                />

                <div className="ml-auto">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    sx={{
                      textTransform: 'none',
                    }}
                    onClick={handleSaveLocale}
                  >
                    Save Locale
                  </Button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Edit;
