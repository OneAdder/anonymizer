import setuptools


with open("requirements.txt") as fp:
    install_requires = fp.read()
with open("long_description.md") as long_desc_file:
    long_desc = long_desc_file.read()


setuptools.setup(
    name="anonymizer",
    version="0.1rc1",
    author="Deep People",
    description="Anonymizer service",
    long_description=long_desc,
    long_description_conttype="text/markdown",
    url="https://github.com/OneAdder/anonymizer",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
    ],
    install_requires=install_requires,
    zip_safe=False,
)
