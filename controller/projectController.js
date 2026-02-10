import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/projectSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const addNewProject = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Project Banner Image Required!", 404));
  }
  const { projectBanner, projectImages } = req.files;
  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
  } = req.body;
  if (
    !title ||
    !description ||
    !gitRepoLink ||
    !projectLink ||
    !stack ||
    !technologies ||
    !deployed
  ) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }

  // UPLOAD BANNER
  const bannerResponse = await cloudinary.uploader.upload(
    projectBanner.tempFilePath,
    { folder: "PORTFOLIO PROJECT IMAGES" }
  );
  if (!bannerResponse || bannerResponse.error) {
    return next(new ErrorHandler("Failed to upload banner to Cloudinary", 500));
  }

  // UPLOAD GALLERY IMAGES
  let uploadedProjectImages = [];
  if (projectImages) {
    const imagesArray = Array.isArray(projectImages) ? projectImages : [projectImages];
    for (const image of imagesArray) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "PORTFOLIO PROJECT GALLERIES",
      });
      uploadedProjectImages.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  }

  const project = await Project.create({
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    technologies,
    deployed,
    projectBanner: {
      public_id: bannerResponse.public_id,
      url: bannerResponse.secure_url,
    },
    projectImages: uploadedProjectImages,
  });
  res.status(201).json({
    success: true,
    message: "New Project Added!",
    project,
  });
});

export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const newProjectData = {
    title: req.body.title,
    description: req.body.description,
    stack: req.body.stack,
    technologies: req.body.technologies,
    deployed: req.body.deployed,
    projectLink: req.body.projectLink,
    gitRepoLink: req.body.gitRepoLink,
  };

  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHandler("Project Not Found!", 404));
  }

  // UPDATE BANNER IF PROVIDED
  if (req.files && req.files.projectBanner) {
    await cloudinary.uploader.destroy(project.projectBanner.public_id);
    const bannerResponse = await cloudinary.uploader.upload(
      req.files.projectBanner.tempFilePath,
      { folder: "PORTFOLIO PROJECT IMAGES" }
    );
    newProjectData.projectBanner = {
      public_id: bannerResponse.public_id,
      url: bannerResponse.secure_url,
    };
  }

  // ADD TO GALLERY IF PROVIDED (Appending)
  if (req.files && req.files.projectImages) {
    const imagesArray = Array.isArray(req.files.projectImages)
      ? req.files.projectImages
      : [req.files.projectImages];

    let newGallery = [...project.projectImages];
    for (const image of imagesArray) {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "PORTFOLIO PROJECT GALLERIES",
      });
      newGallery.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    newProjectData.projectImages = newGallery;
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Project Updated!",
    project: updatedProject,
  });
});

export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Already Deleted!", 404));
  }

  // DELETE BANNER
  await cloudinary.uploader.destroy(project.projectBanner.public_id);

  // DELETE GALLERY IMAGES
  if (project.projectImages && project.projectImages.length > 0) {
    for (const image of project.projectImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Project Deleted!",
  });
});

export const getAllProjects = catchAsyncErrors(async (req, res, next) => {
  const projects = await Project.find().sort({ updatedAt: -1 });
  console.log(projects);
  res.status(200).json({
    success: true,
    projects,
  });
});

export const getSingleProject = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
});
