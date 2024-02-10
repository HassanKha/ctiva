import React, { useState, useEffect } from "react";
import axios from "axios";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);
    console.log(formData);
    try {
      const response = await axios.post(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const ImageButtering = response.data.image;

      setImageSrc(`data:image/png;base64,${ImageButtering}`);
      console.log(response.data.Stats);
      setData(response.data.Stats)
      setMessage("uploaded successfully");
    } catch (error) {
      console.log(error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div className="max-w-screen ">
      <form className="w-full flex justify-center items-center gap-5" onSubmit={handleSubmit}>
        <input
          type="file"
          name="csvFile"
          accept=".csv"
          onChange={handleFileChange}
          className="file:bg-violet-50 file:text-violet-500 hover:file:bg-violet-200
          file:rounded-lg file:rounded-tr-none file:rounded-br-none
          file:px-4 file:py-2 file:mr-4 file:border-none
          hover:cursor-pointer border rounded-lg text-gray-400
          "
        />
        <button className="outline-none bg-violet-50 px-3 py-3 cursor-pointer rounded-md font-sans text-violet-500 text-sm font-medium hover:bg-violet-200 " type="submit">Upload</button>
      </form>
      
      <div className="flex flex-col justify-evenly items-center gap-5">
          <div className="m-2">{message}</div>
        <div className="flex bg-violet-300 justify-center items-center gap-28 p-5 shadow-md">
          <div className="font-medium"> Mean</div>
          <div className="text-gray-100 font-medium border p-1">{ data ? data.meanAge : '??'}</div>
        </div>
        <div className="flex bg-violet-300 justify-center items-center gap-28 p-5 shadow-md">
          <div className="font-medium"> Median</div>
          <div className="text-gray-100 font-medium border p-1">{ data ? data.medianAge : '??'}</div>
        </div>
        <div className="flex bg-violet-300 justify-center items-center gap-28 p-5 shadow-md">
          <div className="font-medium"> Age Average</div>
          <div className="text-gray-100 font-medium border p-1">{ data ? data.ageRange : '??'}</div>
        </div>
        <div>{imageSrc && <img className="shadow-xl" src={imageSrc} alt="Age Distribution" />}</div>
      </div>
    </div>
  );
}

export default UploadForm;
