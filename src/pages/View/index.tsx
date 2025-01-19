import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { determineColorClass } from '../../helpers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

interface Page {
  id: string;
  name: string;
  tags: string[];
  image_link: string;
  annotated_image_link: string;
  locale: any;
}

const View = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seeAnnotatedImage, setSeeAnnotatedImage] = useState(false);
  const [page, setPage] = useState<Page>();
  const [seeLocaleInJson, setSeeLocaleInJson] = useState(false);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`/api/v1/page/${id}`);
      setPage(response.data.data);
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
                    <FormControlLabel
                      sx={{ display: 'block' }}
                      control={
                        <Switch
                          checked={seeAnnotatedImage}
                          onClick={() =>
                            setSeeAnnotatedImage(!seeAnnotatedImage)
                          }
                          name="loading"
                          color="primary"
                        />
                      }
                      label="View Annotation"
                    />
                  </div>
                  {seeAnnotatedImage ? (
                    <img
                      src={page?.annotated_image_link}
                      alt={page?.name}
                      className="max-h-screen w-auto object-cover border-2"
                    />
                  ) : (
                    <img
                      src={page?.image_link}
                      alt={page?.name}
                      className="max-h-screen w-auto object-cover border-2"
                    />
                  )}
                </div>
              </div>
            </td>
            <td className="py-2 px-4 border-2">
              <div className="flex flex-col justify-center items-center gap-2">
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

export default View;
