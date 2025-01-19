import { ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { MultiValue } from 'react-select';
import { DebounceInput } from 'react-debounce-input';
import { determineColorClass } from '../../helpers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Tag {
  name: string;
}

interface Page {
  id: string;
  name: string;
  tags: string[];
  image_link: string;
  annotated_image_link: string;
  locale: any;
}

interface SelectOption {
  value: string;
  label: string;
}

const Home = (): ReactElement => {
  const navigate = useNavigate();

  const [availableTags, setAvailableTags] = useState<SelectOption[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState<string>('');

  const [pages, setPages] = useState<Page[]>([]);

  const [isCreateTagModalOpen, setIsCreateTagModalOpen] =
    useState<boolean>(false);
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] =
    useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] =
    useState<boolean>(false);

  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] =
    useState<boolean>(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);

  const [pageName, setPageName] = useState<string>('');
  const [locale, setLocale] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [searchPageName, setSearchPageName] = useState<string>('');

  const fetchAvailableTags = async () => {
    try {
      const response = await axios.get(`/api/v1/tag`);
      setAvailableTags(
        response.data.data.map((tag: Tag) => ({
          value: tag.name,
          label: tag.name,
        }))
      );
    } catch (error) {
      toast.error('Error fetching tags');
    }
  };

  const fetchPages = async (): Promise<void> => {
    try {
      const constructQueryParams = () => {
        let queryParams = [];

        if (selectedTags.length > 0) {
          queryParams.push(`tags=${selectedTags.join(',')}`);
        }

        if (searchPageName !== '') {
          queryParams.push(`name=${encodeURIComponent(searchPageName)}`);
        }

        return queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      };

      const response = await axios.get(`/api/v1/page${constructQueryParams()}`);
      setPages(response.data.data);
    } catch (error) {
      toast.error('Error fetching pages');
    }
  };

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  useEffect(() => {
    fetchPages();
  }, [selectedTags, searchPageName]);

  const handleTagChange = (selectedOptions: MultiValue<SelectOption>) => {
    setSelectedTags(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateTagSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(`/api/v1/tag`, {
        name: newTagName,
      });
      if (response.data.success === true) {
        toast.success('Tag created successfully!');
      } else {
        if (response.data.error) {
          toast.error(response.data.error);
        }
      }
    } catch (error) {
      toast.error('Error creating tag.');
    }
    setIsCreateTagModalOpen(false);
    setSelectedTags([]);
  };

  const handleCreatePageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploadedImage) {
      const formData = new FormData();
      formData.append('file', uploadedImage);
      formData.append('pagename', pageName);
      formData.append('tags', selectedTags.join(','));
      formData.append('locale', locale);

      try {
        const response = await axios.post(`/api/v1/page`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success === true) {
          toast.success('Page created successfully!');
        } else {
          if (response.data.error) {
            toast.error(response.data.error);
          }
        }
      } catch (error) {
        toast.error('Error uploading image.');
      }
    }
    setIsCreatePageModalOpen(false);
    setSelectedTags([]);
  };

  const handleBulkUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (bulkUploadFile) {
      const formData = new FormData();
      formData.append('file', bulkUploadFile);

      try {
        const response = await axios.post(
          `/api/v1/page/bulk-insert`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success === true) {
          toast.success('Bulk upload is done successfully!');
        } else {
          if (response.data.error) {
            toast.error(response.data.error);
          }
        }
      } catch (error) {
        toast.error('Error doing bulk upload');
      }
    }
    setIsBulkUploadModalOpen(false);
  };

  const handleDelete = async (event: React.MouseEvent, page: Page) => {
    event.preventDefault();
    try {
      const response = await axios.delete(`/api/v1/page/${page.id}`);

      if (response.data.success === true) {
        toast.success('Page is deleted successfully!');
      } else {
        if (response.data.error) {
          toast.error(response.data.error);
        }
      }
    } catch (error) {
      toast.error('Error delting tag.');
    }
  };

  const sortByName = (obj: Record<string, any>) => {
    const array = Object.entries(obj).map(([key, value]) => ({
      name: key,
      value,
    }));
    array.sort((a, b) => a.name.localeCompare(b.name));
    const sortedObj = array.reduce(
      (acc, { name, value }) => {
        acc[name] = value;
        return acc;
      },
      {} as Record<string, any>
    );

    return sortedObj;
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(`/api/v1/download`, {
        tags: selectedTags.join(','),
      });

      const en: Record<string, any> = {};
      const id: Record<string, any> = {};
      const vn: Record<string, any> = {};
      response.data.data.forEach((item: any) => {
        en[item.name] = item.values.en;
        id[item.name] = item.values.id;
        vn[item.name] = item.values.vn;
      });

      const downloadJSON = (data: Record<string, any>, filename: string) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      downloadJSON(sortByName(en), 'en.json');
      downloadJSON(sortByName(id), 'id.json');
      downloadJSON(sortByName(vn), 'vn.json');
      toast.success('File is downloaded successfully!');
    } catch (error) {
      toast.error('Error downloading image.');
    }
  };

  const handleDownloadSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleDownload();
    setIsDownloadModalOpen(false);
    setSelectedTags([]);
  };

  const showCreatePageModal = () => {
    return (
      isCreatePageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Create Page</h2>
            <form onSubmit={handleCreatePageSubmit}>
              <div className="text-left mb-4">
                <label
                  className="	text-gray-700 text-sm font-bold mb-2"
                  htmlFor="itemName"
                >
                  Page Name
                </label>
                <input
                  type="text"
                  placeholder="Page name here"
                  id="itemName"
                  name="itemName"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="text-left mb-4">
                <label
                  className="	text-gray-700 text-sm font-bold mb-2"
                  htmlFor="itemName"
                >
                  Tags
                </label>
                <Select
                  isMulti
                  options={availableTags}
                  placeholder="Filter by tags"
                  onChange={handleTagChange}
                  className="border-2"
                />
              </div>

              <div className="text-left mb-4">
                <label
                  className="text-gray-700 text-sm font-bold mb-2"
                  htmlFor="itemImage"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="itemImage"
                  name="itemImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              {imagePreviewUrl && (
                <div className="mb-4">
                  <img
                    src={imagePreviewUrl}
                    alt="Selected"
                    className="rounded"
                    style={{ height: '300px', width: 'auto' }}
                  />
                </div>
              )}

              <div className="text-left mb-4">
                <label
                  className="text-gray-700 text-sm font-bold mb-2"
                  htmlFor="locale"
                >
                  Locale
                </label>
                <input
                  type="text"
                  placeholder="Locale string in JSON"
                  id="locale"
                  name="locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatePageModalOpen(false);
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    );
  };

  const showCreateTagModal = () => {
    return (
      isCreateTagModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Create Tag</h2>
            <form onSubmit={handleCreateTagSubmit}>
              <div className="text-left mb-4">
                <label
                  className="	text-gray-700 text-sm font-bold mb-2"
                  htmlFor="itemName"
                >
                  Tag Name
                </label>
                <input
                  type="text"
                  placeholder="Insert tag name here"
                  id="itemName"
                  name="itemName"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateTagModalOpen(false);
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setBulkUploadFile(file);
    }
  };

  const showBulkUploadModal = () => {
    return (
      isBulkUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Bulk Upload File</h2>
            <form onSubmit={handleBulkUploadSubmit}>
              <div className="text-left mb-4">
                <label
                  className="text-gray-700 text-sm font-bold mb-2"
                  htmlFor="itemImage"
                >
                  File
                </label>
                <input
                  type="file"
                  id="itemImage"
                  name="itemImage"
                  accept="application/json"
                  onChange={handleFileChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkUploadModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    );
  };

  const showDownloadModal = () => {
    return (
      isDownloadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Download Files</h2>
            <form onSubmit={handleDownloadSubmit}>
              <div className="flex items-center gap-2 mb-4">
                <Select
                  isMulti
                  options={availableTags}
                  placeholder="Filter by tags"
                  onChange={handleTagChange}
                  className="min-w-64 max-w-lg w-80 border-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadModalOpen(false);
                    setSelectedTags([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    );
  };

  return (
    <div className="container mt-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2 items-center">
          <Button
            size="medium"
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={() => setIsCreatePageModalOpen(true)}
          >
            New Page
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={() => setIsCreateTagModalOpen(true)}
          >
            New Tag
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="info"
            startIcon={<CloudUploadIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={() => setIsBulkUploadModalOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            size="medium"
            variant="contained"
            color="success"
            startIcon={<CloudDownloadIcon />}
            sx={{
              textTransform: 'none',
            }}
            onClick={() => setIsDownloadModalOpen(true)}
          >
            Download
          </Button>
        </div>
        <div className="flex items-center gap-2 ">
          <DebounceInput
            minLength={1}
            debounceTimeout={300}
            placeholder="Search by page name"
            onChange={(e) => setSearchPageName(e.target.value)}
            className="px-4 py-2 rounded min-w-64 max-w-lg w-80 border-2"
          />
          <Select
            isMulti
            options={availableTags}
            placeholder="Filter by tags"
            onChange={handleTagChange}
            className="min-w-64 max-w-lg w-80 border-2"
          />
        </div>
      </div>

      <table className="min-w-full bg-white border-2 border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border-2">ID</th>
            <th className="py-2 px-4 border-2">Page</th>
            <th className="py-2 px-4 border-2">Image</th>
            <th className="py-2 px-4 border-2">Locale</th>
            <th className="py-2 px-4 border-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td className="py-2 px-4 border-2">{page.id}</td>
              <td className="py-2 px-4 border-2">
                <div className="text-2xl font-bold">{page.name}</div>
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
                  <img
                    src={page.image_link}
                    alt={page.name}
                    className="w-40 border-2"
                  />
                </div>
              </td>
              <td className="py-2 px-4 border-2">
                <table className="min-w-full bg-white border-2 border-collapse">
                  <thead>
                    <tr>
                      <th className="py-1 px-2 border-2">Key</th>
                      <th className="py-1 px-2 border-2">ID</th>
                      <th className="py-1 px-2 border-2">EN</th>
                      <th className="py-1 px-2 border-2">VN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(page?.locale).map(
                      (subItem: any, index: number) => (
                        <tr key={index}>
                          <td className="py-1 px-2 border-2 font-bold max-w-60 break-words">
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
              </td>
              <td className="py-2 px-4 border-2">
                <div className="flex flex-col gap-2 items-center justify-content">
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      textTransform: 'none',
                    }}
                    onClick={() => navigate(`/${page.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<EditIcon />}
                    sx={{
                      textTransform: 'none',
                    }}
                    onClick={() => navigate(`/${page.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{
                      textTransform: 'none',
                    }}
                    onClick={(e) => handleDelete(e, page)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showCreatePageModal()}
      {showCreateTagModal()}
      {showBulkUploadModal()}
      {showDownloadModal()}
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

export default Home;
