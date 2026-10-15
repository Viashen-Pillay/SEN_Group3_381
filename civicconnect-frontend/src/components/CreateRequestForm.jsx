import { useEffect, useState } from "react";
import {createRequest,getCategories} from "../services/requestService";
import "../styles/requestForm.css";

export function CreateRequestForm({onRequestCreated,requesterId}) {
  const [formData, setFormData] = useState({
    category_id: "",
    title: "",
    description: ""
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        if (active) {
          setCategories(
            data.filter(category => category.is_active)
          );
        }
      } catch (err) {
        if (active) {
          setErrors(previous => ({
            ...previous,
            category_id: err.message
          }));
        }
      } finally {
        if (active) setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData(previous => ({
      ...previous,
      [name]: value
    }));

    setErrors(previous => ({
      ...previous,
      [name]: "",
      submit: ""
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!formData.category_id) {
      validationErrors.category_id =
        "Please select a category.";
    }

    if (!formData.title.trim()) {
      validationErrors.title =
        "Please enter a request title.";
    }

    if (formData.description.trim().length < 10) {
      validationErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (!requesterId) {
      validationErrors.submit =
        "You must be logged in to submit a request.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccess("");

    try {
      const savedRequest = await createRequest(
        {
          category_id: formData.category_id,
          title: formData.title.trim(),
          description: formData.description.trim()
        },
        requesterId
      );

      // Use the actual database-generated request ID.
      setSuccess(
        `Request #${savedRequest.request_id} saved successfully!`
      );

      onRequestCreated?.(savedRequest);

      setFormData({
        category_id: "",
        title: "",
        description: ""
      });
    } catch (err) {
      setErrors({
        submit: err.message ||
          "Unable to save request. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-form-container">
      <div className="request-form-heading">
        <h2>Submit Service Request</h2>
        <p>Describe the issue you would like to report.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        {success && (
          <div className="form-success" role="status">
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="form-error" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="category_id">
            Category *
          </label>

          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            disabled={categoriesLoading || isSubmitting}
            aria-invalid={Boolean(errors.category_id)}
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select a category"}
            </option>

            {categories.map(category => (
              <option
                key={category.category_id}
                value={category.category_id}
              >
                {category.category_name}
              </option>
            ))}
          </select>

          {errors.category_id && (
            <span className="form-error">
              {errors.category_id}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Request Title *
          </label>

          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken air conditioner"
            maxLength={150}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
          />

          {errors.title && (
            <span className="form-error">
              {errors.title}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the issue..."
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.description)}
          />

          {errors.description && (
            <span className="form-error">
              {errors.description}
            </span>
          )}
        </div>

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || categoriesLoading}
        >
          {isSubmitting
            ? "Saving Request..."
            : "Submit Request"}
        </button>
      </form>
    </div>
  );
}