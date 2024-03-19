"use client";

import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

import React, { useEffect, useRef, useState } from "react";

function Home() {
  const [model, setModel] = useState(null);

  useEffect(() => {
    async function loadModel() {
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      console.log("Model loaded");
    }
    loadModel();
  }, []);

  async function compareImages(event) {
    const imageInput = event.target.files;
    const uploadedImagesDiv = document.getElementById("uploadedImages");
    const similarImagesDiv = document.getElementById("similarImages");

    if (imageInput.length < 2) {
      alert("Please select at least two images.");
      return;
    }

    uploadedImagesDiv.innerHTML = "";
    similarImagesDiv.innerHTML = "";

    const promises = Array.from(imageInput).map((file) =>
      loadImage(URL.createObjectURL(file)),
    );
    const imgs = await Promise.all(promises);

    const features = await Promise.all(imgs.map(extractFeatures));

    const similarityScores = [];
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const similarityScore = calculateSimilarity(features[i], features[j]);
        similarityScores.push({
          imageIndex1: i,
          imageIndex2: j,
          similarityScore,
        });
      }
    }

    const uniqueSimilarImages = new Set();
    for (const score of similarityScores) {
      if (score.similarityScore >= -1 && score.similarityScore < -0.9) {
        uniqueSimilarImages.add(score.imageIndex1);
        uniqueSimilarImages.add(score.imageIndex2);
      }
    }

    for (const file of imageInput) {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(file);
      image.style.width = "250px";
      image.style.height = "250px";
      image.style.marginRight = "10px";

      uploadedImagesDiv.appendChild(image);
    }

    for (const index of uniqueSimilarImages) {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(imageInput[index]);
      image.style.width = "250px"; // Set width to 40px
      image.style.height = "250px";
      image.style.marginRight = "10px";
      similarImagesDiv.appendChild(image);
    }
  }

  async function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () =>
        resolve(
          tf.browser
            .fromPixels(img)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims(),
        );
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  async function extractFeatures(image) {
    const features = model.infer(image, "conv_preds");
    return features;
  }

  function calculateSimilarity(featureVector1, featureVector2) {
    const cosineSimilarity = tf.metrics.cosineProximity(
      featureVector1,
      featureVector2,
    );
    return cosineSimilarity.dataSync()[0];
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <h1>Image Similarity Detection</h1>
      <input type="file" id="imageInput" multiple onChange={compareImages} />
      <h2>All Uploaded Images</h2>
      <div id="uploadedImages" className="flex shrink-0"></div>
      <h2>Similar Images</h2>
      <div id="similarImages" className="flex shrink-0"></div>
      {/* <h2>Images with Multiple Faces</h2> */}
      {/* <div className="flex">
        {imagesWithMultipleFaces.map((image, index) => (
          <img
            key={index}
            src={URL.createObjectURL(image)}
            style={{ width: "250px", height: "250px", marginRight: "10px" }}
          />
        ))}
      </div> */}
    </main>
  );
}

export default Home;
