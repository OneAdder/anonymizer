import setuptools


with open("requirements.txt") as fp:
    install_requires = fp.read()


setuptools.setup(
    name="anonymizer",
    version="0.1",
    author="Emelyanov Yaroslav",
    description="Anonymizer service",
    long_description="Anonymizer service",
    long_description_conttype="text/markdown",
    # url="https://github.com/pypa/sampleproject",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    install_requires=install_requires,
    zip_safe=False,
)
