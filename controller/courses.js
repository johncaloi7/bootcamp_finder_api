const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

//@description    Get courses
//@route          GET api/v1/courses
//@route          GET api/v1/bootcamps/:bootcampId/courses
//@access         PUBLIC

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@description    Get single course
//@route          GET api/v1/courses/:id
//@access         PUBLIC

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return new ErrorResponse(`No course with and id ${req.params.id}`, 400);
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@description    Add course
//@route          POST api/v1/bootcamps/:bootcampId/courses
//@access         PRIVATE  --> requires authentication

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return new ErrorResponse(
      `No bootcamp with and id ${req.params.bootcampId}`,
      400
    );
  }

  // Make sure user is course owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to add course to ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@description    Update course
//@route          PUT api/v1/courses/:id
//@access         PRIVATE  --> requires authentication

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return new ErrorResponse(`No course with and id ${req.params.id}`, 400);
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to update course.`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@description    DELETE course
//@route          DELETE api/v1/courses/:id
//@access         PRIVATE  --> requires authentication

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return new ErrorResponse(`No course with and id ${req.params.id}`, 400);
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        ` User ${req.user.id} is not authorized to delete course.`,
        401
      )
    );
  }
  await course.remove();

  res.status(204).json({
    success: true,
    data: {},
  });
});
